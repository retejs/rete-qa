
Envs:

`APP` - app folder name
`SERVE` - folder inside app folder with a bundles

Run tests for development purposes:

```bash
APP=react18 SERVE=build npx playwright test --config ./src/playwright.config.ts
```

Run tests for specific browser

```bash
APP=react18 SERVE=build npx playwright test --config ./src/playwright.config.ts --project=chromium
```
