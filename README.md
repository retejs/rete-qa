Rete quality assurance
====
#### Rete.js tool

Getting started
----

Install Rete QA

```bash
npm i -g rete-qa
```

Create `.rete-qa` folder with applications of different stacks needed for testing

```bash
rete-qa init --deps-alias dependencies.json
```

where `dependencies.json` (optional) is file with mapping of `<package name>` to npm install `<argument>`

Run tests
----

Run tests for provided stacks (react, vue, angular) and different browsers (chromium, firefox, webkit)
```bash
rete-qa test
```
