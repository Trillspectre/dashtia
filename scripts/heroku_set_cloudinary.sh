#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/heroku_set_cloudinary.sh <heroku-app-name> [--url <CLOUDINARY_URL>] [--cloud <CLOUD_NAME> --key <API_KEY> --secret <API_SECRET>]
# Example (single var):
#   ./scripts/heroku_set_cloudinary.sh my-app --url "cloudinary://KEY:SECRET@CLOUD"
# Example (split):
#   ./scripts/heroku_set_cloudinary.sh my-app --cloud mycloud --key KEY --secret SECRET

HEROKU_APP="${1:-}"
shift || true

if [[ -z "$HEROKU_APP" ]]; then
  echo "Error: missing Heroku app name (first argument)"
  echo "Usage: $0 <heroku-app-name> [--url <CLOUDINARY_URL>] [--cloud <CLOUD_NAME> --key <API_KEY> --secret <API_SECRET>]"
  exit 2
fi

CLOUDINARY_URL=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url)
      CLOUDINARY_URL="$2"
      shift 2
      ;;
    --cloud)
      CLOUDINARY_CLOUD_NAME="$2"
      shift 2
      ;;
    --key)
      CLOUDINARY_API_KEY="$2"
      shift 2
      ;;
    --secret)
      CLOUDINARY_API_SECRET="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 <heroku-app-name> [--url <CLOUDINARY_URL>] [--cloud <CLOUD_NAME> --key <API_KEY> --secret <API_SECRET>]"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 2
      ;;
  esac
done

# If no credentials provided, prompt interactively
if [[ -z "$CLOUDINARY_URL" && -z "$CLOUDINARY_API_KEY" ]]; then
  echo "No Cloudinary credentials provided as flags.";
  read -rp "Enter CLOUDINARY_URL (or leave blank to use split vars): " CLOUDINARY_URL
  if [[ -z "$CLOUDINARY_URL" ]]; then
    read -rp "Enter CLOUDINARY_CLOUD_NAME: " CLOUDINARY_CLOUD_NAME
    read -rp "Enter CLOUDINARY_API_KEY: " CLOUDINARY_API_KEY
    read -rsp "Enter CLOUDINARY_API_SECRET: " CLOUDINARY_API_SECRET
    echo
  fi
fi

if [[ -n "$CLOUDINARY_URL" ]]; then
  echo "Setting CLOUDINARY_URL on Heroku app $HEROKU_APP..."
  heroku config:set CLOUDINARY_URL="$CLOUDINARY_URL" -a "$HEROKU_APP"
else
  echo "Setting split CLOUDINARY vars on Heroku app $HEROKU_APP..."
  heroku config:set CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME" \
    CLOUDINARY_API_KEY="$CLOUDINARY_API_KEY" \
    CLOUDINARY_API_SECRET="$CLOUDINARY_API_SECRET" -a "$HEROKU_APP"
fi

echo "Verifying config..."
heroku config -a "$HEROKU_APP"

echo "Running collectstatic on Heroku (this may take a moment)..."
heroku run python manage.py collectstatic --noinput -a "$HEROKU_APP"

echo "Running the test upload command on Heroku (test_cloudinary)..."
heroku run python manage.py test_cloudinary -a "$HEROKU_APP"

echo "Done. Tail logs with: heroku logs --tail -a $HEROKU_APP"
