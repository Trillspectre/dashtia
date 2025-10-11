Param(
  [Parameter(Mandatory=$true)][string]$HerokuApp,
  [string]$CloudinaryUrl,
  [string]$CloudName,
  [string]$ApiKey,
  [string]$ApiSecret
)

function Usage {
  Write-Host "Usage: .\scripts\heroku_set_cloudinary.ps1 -HerokuApp <app> [-CloudinaryUrl <url>] [-CloudName <name> -ApiKey <key> -ApiSecret <secret>]"
  exit 1
}

if (-not $HerokuApp) { Usage }

if (-not $CloudinaryUrl -and -not $ApiKey) {
  $CloudinaryUrl = Read-Host "Enter CLOUDINARY_URL (or leave blank to set split vars)"
  if (-not $CloudinaryUrl) {
    $CloudName = Read-Host "Enter CLOUDINARY_CLOUD_NAME"
    $ApiKey = Read-Host "Enter CLOUDINARY_API_KEY"
    $ApiSecret = Read-Host -AsSecureString "Enter CLOUDINARY_API_SECRET"
    $ApiSecret = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ApiSecret))
  }
}

if ($CloudinaryUrl) {
  heroku config:set CLOUDINARY_URL="$CloudinaryUrl" -a $HerokuApp
} else {
  heroku config:set CLOUDINARY_CLOUD_NAME="$CloudName" CLOUDINARY_API_KEY="$ApiKey" CLOUDINARY_API_SECRET="$ApiSecret" -a $HerokuApp
}

heroku config -a $HerokuApp
heroku run python manage.py collectstatic --noinput -a $HerokuApp
heroku run python manage.py test_cloudinary -a $HerokuApp
Write-Host "Done. Use 'heroku logs --tail -a $HerokuApp' to monitor runtime logs."
