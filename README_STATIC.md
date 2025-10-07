Static JS workflow

Goal
- Keep readable source modules in `assets/unified-src/` during development.
- Build a single `stats/static/stats/unified.bundle.js` for production and load only that file.

Recommended workflow
1. Development
   - Move your module files to `assets/unified-src/` (this folder is NOT part of `STATICFILES_DIRS`).
   - In `templates/base.html` we set `window.UNIFIED_DASHBOARD_DEV = true` when `DEBUG` is true. The loader `stats/static/stats/unified/index.js` will dynamically fetch scripts from `/assets/unified-src/` and initialize them.
   - This means you can edit source files under `assets/unified-src/` and refresh the page without building.

2. Production build
   - Install Node and run `npm ci` (or `npm install`) in the project root to get esbuild.
   - Run `npm run build:unified` (script in `package.json`) to produce `stats/static/stats/unified.bundle.js`.
   - Deploy and run `python manage.py collectstatic --noinput`. The templates will load `unified.bundle.js` when `DEBUG` is False.

3. Optional: Exclude sources from collectstatic
   - If you want to prevent the source files from being collected to `STATIC_ROOT`, keep them outside `STATICFILES_DIRS` (e.g., `assets/unified-src/` outside `static/`) and only copy the bundle into `stats/static/...` during build.
   - Alternatively, move or delete the source files in CI before `collectstatic` (see README for an example deploy script).

Notes
- `unified.bundle.js` is a single IIFE bundle (no module loader) that preserves the same runtime behavior as the individual modules.
- The dev loader assumes `/assets/unified-src/` will be served as static files by your dev server. Configure your webserver or staticfile handler accordingly.
