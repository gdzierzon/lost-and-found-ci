# Exercise: Lost and Found CI

Exercise code for the lesson **Exercise: Lost and Found CI** in the Node.js in Depth course on [ask-codey.com](https://www.ask-codey.com).

The Lost and Found Desk is a campus API that lists the things students find and records who claims them. Three students work on it together. The API works and its tests pass, but each student writes code a little differently, a few likely mistakes have crept in, and nothing checks a push before it lands on GitHub. You'll add ESLint and Prettier, clean up everything they report, and add a GitHub Actions workflow that lints, checks the format and runs the tests on every push.

## What's here

- `app.js`: the API, `export const app = express()`. The comment at its top lists every request it answers, with the status and JSON body of each. It works, but ESLint and Prettier will have things to say about it. For you to clean up.
- `items.js`: the found items and the claims, kept in memory, and `resetData()`, which puts them back the way they start. For you to clean up too.
- `server.js`: starts the API at `http://localhost:3100`. Ready to use.
- `lost-and-found.insomnia.json`: the requests to try, as an Insomnia collection. Ready to use.
- `app.test.js`: the API's own tests, which pass already. They must still pass when you're done. You don't need to change this file.
- `quality.test.js`: the check for this exercise: your npm scripts, your ESLint config, a clean lint, formatted files and your workflow file. You don't need to change this file.
- `package.json` and `package-lock.json`: the project's settings, its scripts (`start`, `dev` and `test`) and its packages at exact versions: Express 5.3.0, and for working on the project, Supertest 7.3.2, ESLint 10.15.0, @eslint/js 10.0.1, globals 17.14.0 and Prettier 3.10.1. Ready to use: everything you need is already installed by `npm install`.

## Before you start

You need Node.js 24 or later (`node --version` shows yours). In VS Code's terminal, in this folder, install the packages:

```bash
npm install
```

It makes a `node_modules` folder. That folder is in `.gitignore`, so Git leaves it out: `npm install` makes it again on any computer, GitHub's runner included.

## Run it

```bash
npm start
```

The terminal says `The Lost and Found Desk's API is on http://localhost:3100` and keeps running. In Insomnia, click **Import** in your `Node.js in Depth` project, choose `lost-and-found.insomnia.json`, and send any request. The data lives in memory, so it starts fresh each time the API starts. Stop it with **Ctrl+C**.

## What to do

1. **Add three scripts** to `package.json`, beside the ones there:
   - `"lint": "eslint ."`
   - `"format": "prettier --write ."`
   - `"format:check": "prettier --check ."`
2. **Make `eslint.config.js`** at the top of the folder: a flat config with `js.configs.recommended`, `languageOptions: { globals: globals.node }`, and these rules:
   - `eqeqeq: "error"`
   - `"prefer-const": "error"`
   - `"no-unused-vars": ["error", { argsIgnorePattern: "^_" }]`
3. **Run `npm run lint` and fix every problem it reports** by changing the code, never by switching a rule off. There are six, in `app.js` and `items.js`. Run `npm test` after each fix: the API's tests must stay green.
4. **Run `npm run format`**, so Prettier lays out every file the same way.
5. **Make `.github/workflows/ci.yml`**: a workflow that runs `on: [push, pull_request]`, with one job that `runs-on: ubuntu-latest` and has these steps, in this order:
   1. `uses: actions/checkout@v7`
   2. `uses: actions/setup-node@v7`, `with:` `node-version: 26` and `cache: npm`
   3. `run: npm ci`
   4. `run: npm run lint`
   5. `run: npm run format:check`
   6. `run: npm test`

## Check your work

```bash
npm test
```

No server needs to be running. It runs the API's 9 tests (`API 1)` to `API 9)`), which pass from the start, and the exercise's 12 checks (`1)` to `12)`), which all fail at first: that's expected. Each part you finish turns its checks green, and a failing check's message says what's missing, for example _Add "lint": "eslint ." to the scripts in package.json._ Check 7 lists every problem ESLint still reports, with its file, line and column.

When all 21 are green, push your work to GitHub: the **Actions** tab shows your workflow running the same checks on GitHub's computer.

## The rules

- Fix the code, never the rule: no `// eslint-disable` comments, and no rule turned off or down to `"warn"`.
- Every request in the comment at the top of `app.js` answers exactly as it does now. The API's tests check that.
- Don't change `app.test.js` or `quality.test.js`.
- The workflow file is `.github/workflows/ci.yml`, exactly: GitHub only looks for workflows in that folder.

## Tips

- A route parameter is text. If `GET /items/2` turns into a 404 after a fix, compare the id as a number: `Number(id)`.
- Express knows an error handler by its four parameters, so the unused `next` can't go. Rename it `_next`, which your `no-unused-vars` setting skips.
- An import nothing uses can go, line and all.
- YAML is fussy about spaces: indent with two spaces, never tabs, and line up each step's `-` under the one before. Check 9 names the line YAML couldn't read.
- `npm run format` formats `ci.yml` too, so run it after you write the workflow.

## Hand it in

When it works, push your solution to a public repo of your own on GitHub, then paste that repo's address into **Submit your exercise** on the lesson page at [ask-codey.com](https://www.ask-codey.com). That's what completes the lesson. The lesson page shows the Git commands, step by step.
