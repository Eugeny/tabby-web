import fsspec
import logging
import re
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
                    f.flush()
                    plugin_final_target = Path(tempdir) / plugin

                    with tempfile.TemporaryDirectory() as extraction_tmp:
                        subprocess.check_call(
                            ["tar", "-xzf", f.name, "-C", str(extraction_tmp)]
                        )
                        shutil.move(
                            Path(extraction_tmp) / "package", plugin_final_target
                        )

            self._patch_web_ssh_signing(tempdir)

            if fs.exists(target):
                fs.rm(target, recursive=True)
            fs.mkdir(target)
            fs.put(str(tempdir), target, recursive=True)

    # Patterns for the in-browser SSH public-key signing fix (see below).
    _SSH_SIGN_FIXES = [
        (re.compile(r"""signatureAlgo\s*=\s*['"]sha512['"]"""), "signatureAlgo = 'RSA-SHA512'"),
        (re.compile(r"""signatureAlgo\s*=\s*['"]sha256['"]"""), "signatureAlgo = 'RSA-SHA256'"),
    ]

    def _patch_web_ssh_signing(self, root: Path):
        """Fix in-browser SSH public-key authentication.

        Tabby runs ssh2 in the browser, where Node's `crypto` is polyfilled by
        `browserify-sign`. For an RSA user key, ssh2 asks that polyfill to sign
        with the bare digest name ('sha256'/'sha512'), but browserify-sign maps
        those names to an ECDSA algorithm entry whose PKCS#1 DigestInfo prefix is
        empty. The result is either a thrown "wrong private key type" error or a
        signature with no DigestInfo that the server rejects -- so public-key auth
        fails in the web build while it works on the desktop (native crypto).
        See Eugeny/tabby#8069 and Eugeny/tabby-connection-gateway#11.

        Rewriting the algorithm to the proper `RSA-SHA512`/`RSA-SHA256` names makes
        ssh2 use the algorithm entries that carry the correct DigestInfo, producing
        valid rsa-sha2-* signatures. Done here, every downloaded version is fixed.
        """
        patched = 0
        for js in root.rglob("*.js"):
            try:
                text = js.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            if "signatureAlgo" not in text:
                continue
            new = text
            for pattern, replacement in self._SSH_SIGN_FIXES:
                new = pattern.sub(replacement, new)
            if new != text:
                js.write_text(new, encoding="utf-8")
                patched += 1
        logging.info(f"Applied in-browser SSH public-key signing fix to {patched} file(s)")
