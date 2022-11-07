import fsspec
import logging
import requests
import shutil
import subprocess
import tempfile
from django.core.management.base import BaseCommand
from django.conf import settings
from pathlib import Path
from urllib.parse import urlparse


class Command(BaseCommand):
    help = "Downloads a new app version"

    def add_arguments(self, parser):
        parser.add_argument("version", type=str)

    def handle(self, *args, **options):
        version = options["version"]
        target = f"{settings.APP_DIST_STORAGE}/{version}"

        fs = fsspec.filesystem(urlparse(settings.APP_DIST_STORAGE).scheme)

        plugin_list = [
            "tabby-web-container",
            "tabby-core",
            "tabby-settings",
            "tabby-terminal",
            "tabby-ssh",
            "tabby-community-color-schemes",
            "tabby-serial",
            "tabby-telnet",
            "tabby-web",
            "tabby-web-demo",
        ]

        with tempfile.TemporaryDirectory() as tempdir:
            tempdir = Path(tempdir)
            for plugin in plugin_list:
                logging.info(f"Resolving {plugin}@{version}")
                response = requests.get(f"{settings.NPM_REGISTRY}/{plugin}/{version}")
                response.raise_for_status()
                info = response.json()
                url = info["dist"]["tarball"]

                logging.info(f"Downloading {plugin}@{version} from {url}")
                response = requests.get(url)

                with tempfile.NamedTemporaryFile("wb") as f:
                    f.write(response.content)
                    plugin_final_target = Path(tempdir) / plugin

                    with tempfile.TemporaryDirectory() as extraction_tmp:
                        subprocess.check_call(
                            ["tar", "-xzf", f.name, "-C", str(extraction_tmp)]
                        )
                        shutil.move(
                            Path(extraction_tmp) / "package", plugin_final_target
                        )

            if fs.exists(target):
                fs.rm(target, recursive=True)
            fs.mkdir(target)
            fs.put(str(tempdir), target, recursive=True)
