# Heroku + Cloudinary helper

This document describes a small helper script to set Cloudinary config vars on Heroku,
run `collectstatic`, and verify uploads using the `test_cloudinary` management command.

Files included

- `scripts/heroku_set_cloudinary.sh` — bash script for Linux/macOS/WSL/Git Bash.
- `scripts/heroku_set_cloudinary.ps1` — PowerShell script for Windows PowerShell.

Quick usage

Bash (example using single CLOUDINARY_URL):

```bash
./scripts/heroku_set_cloudinary.sh my-heroku-app --url "cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>"
```

Bash (example using split vars):

```bash
./scripts/heroku_set_cloudinary.sh my-heroku-app --cloud mycloud --key <API_KEY> --secret <API_SECRET>
```

PowerShell (interactive prompts if not provided):

```powershell
.\scripts\heroku_set_cloudinary.ps1 -HerokuApp my-heroku-app
```

What the script does

1. Sets either `CLOUDINARY_URL` (recommended) or the split `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` config vars on the Heroku app.
2. Prints `heroku config` to confirm values were set.
3. Runs `python manage.py collectstatic --noinput` on the Heroku dyno to populate static files.
4. Runs the management command `python manage.py test_cloudinary` (added under
   `stats/management/commands/test_cloudinary.py`) to perform a small upload using
   Django's `default_storage`.

Notes and safety

- Do not commit real API keys into the repository. The scripts prompt for values
  or accept them as arguments.
- If `env.py` exists locally and contains secrets, consider removing it from the
  repository and using the Heroku config vars instead (see below for commands).

Removing local secrets from git (example)

```bash
git rm --cached env.py
echo "env.py" >> .gitignore
git add .gitignore
git commit -m "chore: remove local env.py from repo and ignore it"
git push
```

Troubleshooting

- "Must supply api_key" — credentials missing or invalid. Re-run the script with
  correct credentials.
- `collectstatic` errors — the output will list missing files; fix templates or add files
  and re-deploy.
- If `heroku` CLI commands fail, ensure you're logged in (`heroku login`) and have
  permission to the application.

If you want, I can also open a PR with these scripts and the README file or run the
`heroku` commands for you (you'll need to provide the Heroku app name and confirm).
