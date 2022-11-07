import secrets
from django.db import migrations, models


def run_forward(apps, schema_editor):
    for user in apps.get_model("app", "User").objects.all():
        user.config_sync_token = secrets.token_hex(64)
        user.save()


class Migration(migrations.Migration):

    dependencies = [
        ("app", "0003_auto_20210711_1855"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="config_sync_token",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.RunPython(run_forward, lambda _, __: None),
        migrations.AlterField(
            model_name="user",
            name="config_sync_token",
            field=models.CharField(max_length=255),
        ),
    ]
