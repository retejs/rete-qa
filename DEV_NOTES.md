
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

Update snapshots

```bash
rete-kit test -u
```

Run in Docker

```bash
docker run -it --rm -v /usr/share/fonts:/usr/share/fonts -v $(pwd):/data mcr.microsoft.com/playwright:v1.37.1-jammy /bin/bash
cd /data
```

Alternative

```dockerfile
FROM ubuntu:20.04

RUN apt update
ENV NODE_VERSION=16.13.0
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version
RUN npx playwright@1.20 install
RUN npx playwright@1.20 install --with-deps
```
