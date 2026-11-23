// The check for this exercise: your npm scripts, your ESLint config, a clean lint, formatted files, and your
// workflow file. Every check fails at first; each part you finish turns its checks green.
// Run it with the API's tests: npm test (run npm install once first). You don't need to change this file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import * as prettier from "prettier";

const project = fileURLToPath(new URL(".", import.meta.url));
const packageJson = JSON.parse(
  await readFile(new URL("package.json", import.meta.url), "utf8"),
);
const scripts = packageJson.scripts ?? {};

// Reads a file of the exercise, or gives null when it isn't there.
async function readOrNull(name) {
  try {
    return await readFile(new URL(name, import.meta.url), "utf8");
  } catch {
    return null;
  }
}

const expectedScripts = [
  ["1)", "lint", "eslint ."],
  ["2)", "format", "prettier --write ."],
  ["3)", "format:check", "prettier --check ."],
];

for (const [number, name, command] of expectedScripts) {
  test(`${number} package.json has the script "${name}": "${command}"`, () => {
    assert.equal(
      scripts[name],
      command,
      `Add "${name}": "${command}" to the scripts in package.json. It has ${scripts[name] === undefined ? "no such script" : `"${scripts[name]}"`} now.`,
    );
  });
}

// What ESLint's settings come to for app.js, read from your eslint.config.js.
async function configForApp() {
  const config = await readOrNull("eslint.config.js");
  assert.notEqual(
    config,
    null,
    "There's no eslint.config.js yet. Make it at the top of the exercise folder.",
  );
  return new ESLint({ cwd: project }).calculateConfigForFile("app.js");
}

// A rule's level: 2 is "error", 1 is "warn", 0 or missing is "off".
function level(config, rule) {
  return config.rules?.[rule]?.[0] ?? 0;
}

test("4) eslint.config.js turns on ESLint's recommended rules, eqeqeq and prefer-const, as errors", async () => {
  const config = await configForApp();
  assert.equal(
    level(config, "no-undef"),
    2,
    "ESLint's recommended rules aren't on: put js.configs.recommended in the list.",
  );
  assert.equal(level(config, "eqeqeq"), 2, 'Add eqeqeq: "error" to rules.');
  assert.equal(
    level(config, "prefer-const"),
    2,
    'Add "prefer-const": "error" to rules.',
  );
});

test("5) eslint.config.js tells ESLint the names Node provides, with globals.node", async () => {
  const config = await configForApp();
  const known = config.languageOptions?.globals ?? {};
  assert.ok(
    "process" in known && "console" in known,
    "ESLint doesn't know process and console yet: set languageOptions: { globals: globals.node }.",
  );
});

test('6) eslint.config.js reports unused variables as errors, except parameters whose names start with "_"', async () => {
  const config = await configForApp();
  const rule = config.rules?.["no-unused-vars"] ?? [];
  assert.equal(rule[0], 2, 'Set "no-unused-vars" to "error" in rules.');
  assert.equal(
    rule[1]?.argsIgnorePattern,
    "^_",
    'Add "no-unused-vars": ["error", { argsIgnorePattern: "^_" }] to rules.',
  );
});

test("7) npm run lint finds no problems in any file", async () => {
  await configForApp();
  const eslint = new ESLint({ cwd: project });
  const results = await eslint.lintFiles(["."]);
  const problems = [];
  for (const result of results) {
    const file = result.filePath.slice(project.length);
    for (const message of result.messages) {
      problems.push(
        `${file} ${message.line}:${message.column} ${message.message} (${message.ruleId})`,
      );
    }
  }
  assert.deepEqual(
    problems,
    [],
    `ESLint still reports ${problems.length} problem(s). Fix the code, not the rule:\n${problems.join("\n")}`,
  );
});

test("8) npm run format:check finds every file formatted", () => {
  const prettierCli = fileURLToPath(
    new URL("node_modules/prettier/bin/prettier.cjs", import.meta.url),
  );
  const run = spawnSync(
    process.execPath,
    [prettierCli, "--check", ".", "--no-color"],
    { cwd: project, encoding: "utf8" },
  );
  const output = `${run.stdout}\n${run.stderr}`.split(/\r?\n/);
  const unformatted = output
    .filter((line) => line.startsWith("[warn] "))
    .filter((line) => !line.includes("Code style issues"))
    .map((line) => line.slice("[warn] ".length));
  const problem =
    unformatted.length > 0
      ? `Prettier would change ${unformatted.join(", ")}. Run npm run format.`
      : `Prettier couldn't check every file:\n${run.stderr}`;
  assert.equal(run.status, 0, problem);
});

// The workflow, with its comments taken out, so a commented-out line doesn't count.
async function workflow() {
  const text = await readOrNull(".github/workflows/ci.yml");
  assert.notEqual(
    text,
    null,
    "There's no .github/workflows/ci.yml yet. Make the folders .github and workflows inside it, then the file.",
  );
  return text.replace(/(^|\s)#.*$/gm, "");
}

test("9) .github/workflows/ci.yml is valid YAML", async () => {
  const text = await workflow();
  try {
    await prettier.format(text, { parser: "yaml" });
  } catch (error) {
    assert.fail(
      `ci.yml isn't valid YAML: ${error.message.split("\n")[0]}. Check the spaces at the start of that line.`,
    );
  }
});

test("10) The workflow runs on push and pull_request, on ubuntu-latest", async () => {
  const text = await workflow();
  const on = text.match(/^on:[^\n]*(\n[ \t]+[^\n]*)*/m)?.[0] ?? "";
  assert.match(
    on,
    /\bpush\b/,
    "The on: line needs push, such as on: [push, pull_request].",
  );
  assert.match(
    on,
    /\bpull_request\b/,
    "The on: line needs pull_request, such as on: [push, pull_request].",
  );
  assert.match(
    text,
    /runs-on:\s*["']?ubuntu-latest["']?\s*$/m,
    "The job needs runs-on: ubuntu-latest.",
  );
});

// Where a step is in the file, or -1 when it isn't there.
function where(text, pattern) {
  return text.search(pattern);
}

test("11) The steps check out the code, then set up Node 26 with the npm cache", async () => {
  const text = await workflow();
  const checkout = where(text, /uses:\s*["']?actions\/checkout@v7\b/);
  const setupNode = where(text, /uses:\s*["']?actions\/setup-node@v7\b/);
  assert.notEqual(checkout, -1, "Add the step - uses: actions/checkout@v7.");
  assert.notEqual(setupNode, -1, "Add the step - uses: actions/setup-node@v7.");
  assert.ok(
    checkout < setupNode,
    "actions/checkout comes before actions/setup-node.",
  );
  assert.match(
    text,
    /node-version:\s*["']?26["']?\s*$/m,
    "Give setup-node node-version: 26, under with:.",
  );
  assert.match(
    text,
    /cache:\s*["']?npm["']?\s*$/m,
    "Give setup-node cache: npm, under with:.",
  );
});

test("12) Then the steps run npm ci, npm run lint, npm run format:check and npm test, in that order", async () => {
  const text = await workflow();
  const setupNode = where(text, /uses:\s*["']?actions\/setup-node@v7\b/);
  const steps = [
    ["npm ci", where(text, /run:\s*npm ci\s*$/m)],
    ["npm run lint", where(text, /run:\s*npm run lint\s*$/m)],
    ["npm run format:check", where(text, /run:\s*npm run format:check\s*$/m)],
    ["npm test", where(text, /run:\s*npm (run )?test\s*$/m)],
  ];
  for (const [command, at] of steps) {
    assert.notEqual(at, -1, `Add the step - run: ${command}.`);
  }
  assert.ok(
    setupNode < steps[0][1],
    "npm ci comes after actions/setup-node, which installs Node and npm.",
  );
  for (let i = 1; i < steps.length; i++) {
    assert.ok(
      steps[i - 1][1] < steps[i][1],
      `${steps[i - 1][0]} comes before ${steps[i][0]}.`,
    );
  }
});
