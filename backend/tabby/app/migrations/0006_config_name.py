from django.db import migrations, models


def run_forward(apps, schema_editor):
    for config in apps.get_model("app", "Config").objects.all():
        config.name = f"Unnamed config ({config.created_at.date()})"
        config.save()


class Migration(migrations.Migration):

    dependencies = [
        ("app", "0005_user_force_pro"),
    ]

    operations = [
        migrations.AddField(
            model_name="config",
            name="name",
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.RunPython(run_forward, lambda _, __: None),
        migrations.AlterField(
            model_name="config",
            name="name",
            field=models.CharField(max_length=255),
        ),
    ]
