# Generated manually for adding owner and is_public to Holding model

from django.db import migrations, models
from django.contrib.auth import get_user_model
import django.db.models.deletion

User = get_user_model()

class Migration(migrations.Migration):

    dependencies = [
        ('inverstment', '0002_holding_member_portfolio_transaction_and_more'),
        ('authentication', '0004_user_created_by'),  # Assuming this exists
    ]

    operations = [
        migrations.AddField(
            model_name='holding',
            name='is_public',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='holding',
            name='owner',
            field=models.ForeignKey(
                default=1,  # Default to first user, adjust as needed
                on_delete=django.db.models.deletion.CASCADE,
                related_name='holdings',
                to='authentication.user'
            ),
        ),
        migrations.AlterField(
            model_name='holding',
            name='portfolio',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='holdings',
                to='inverstment.portfolio'
            ),
        ),
    ]
