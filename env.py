import os

os.environ.setdefault(
    "DATABASE_URL", "postgresql://neondb_owner:npg_UFTIlRJ52ejv@ep-polished-sky-agq1t82d.c-2.eu-central-1.aws.neon.tech/onion_shun_human_657812"
)
os.environ.setdefault(
    "SECRET_KEY", "django-insecure-141qyj&x=w-ra&*1mv*l$1@q=cgk5f$d#uauokjv99z&p5bf&i"
)
os.environ.setdefault(
    "CLOUDINARY_URL", "cloudinary://771451762784326:5T9GRx7KzLZifvJlzrx4HaM2oAU"
)
# choose which DEBUG method to use manualy by Commenting in or out the relevant variable
# os.environ['DEBUG'] = 'True'  # For local development

# os.environ['DEBUG'] = 'False'  # To test production-like behavior locally