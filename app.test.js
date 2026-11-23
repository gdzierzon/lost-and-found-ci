// The API's own tests. They pass on the starter, because the API already works, and they must still pass when
// you've cleaned up the code: a fix that changes what a request answers turns one of them red.
// Run them with: npm test (run npm install once first). You don't need to change this file.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "./app.js";
import { items, claims, resetData } from "./items.js";

beforeEach(() => {
  resetData();
});

test("API 1) GET /items answers 200 with all 5 items", async () => {
  const response = await request(app).get("/items");
  assert.equal(response.status, 200, `GET /items answered ${response.status}.`);
  assert.deepEqual(response.body, items);
});

test("API 2) GET /items?status=waiting answers 200 with items 1, 2 and 4", async () => {
  const response = await request(app).get("/items?status=waiting");
  assert.equal(
    response.status,
    200,
    `GET /items?status=waiting answered ${response.status}.`,
  );
  assert.deepEqual(
    response.body.map((item) => item.id),
    [1, 2, 4],
  );
});

test("API 3) GET /items/2 answers 200 with the math textbook", async () => {
  const response = await request(app).get("/items/2");
  assert.equal(
    response.status,
    200,
    `GET /items/2 answered ${response.status}. A route parameter is text, so "2" === 2 is false: turn it into a number first.`,
  );
  assert.equal(response.body.name, "Math textbook");
});

test('API 4) GET /items/99 answers 404 with detail "There\'s no item 99."', async () => {
  const response = await request(app).get("/items/99");
  assert.equal(
    response.status,
    404,
    `GET /items/99 answered ${response.status}.`,
  );
  assert.deepEqual(response.body, {
    status: 404,
    title: "Not Found",
    detail: "There's no item 99.",
  });
});

test("API 5) POST /items/1/claims with Jordan answers 201, and item 1 becomes claimed", async () => {
  const response = await request(app)
    .post("/items/1/claims")
    .send({ name: "Jordan" });
  assert.equal(
    response.status,
    201,
    `POST /items/1/claims answered ${response.status}.`,
  );
  assert.deepEqual(response.body, { id: 3, itemId: 1, name: "Jordan" });
  assert.equal(claims.length, 3);
  const item = await request(app).get("/items/1");
  assert.equal(item.body.status, "claimed");
});

test("API 6) POST /items/3/claims answers 409: item 3 is already claimed", async () => {
  const response = await request(app)
    .post("/items/3/claims")
    .send({ name: "Jordan" });
  assert.equal(
    response.status,
    409,
    `POST /items/3/claims answered ${response.status}.`,
  );
  assert.equal(response.body.detail, "Item 3 has already been claimed.");
  assert.equal(claims.length, 2);
});

test("API 7) POST /items/2/claims with no name answers 400 and saves nothing", async () => {
  const response = await request(app).post("/items/2/claims").send({});
  assert.equal(
    response.status,
    400,
    `POST /items/2/claims answered ${response.status}.`,
  );
  assert.deepEqual(response.body.problems, [
    { field: "name", message: "name is required." },
  ]);
  assert.equal(claims.length, 2);
});

test("API 8) POST /items/99/claims answers 404", async () => {
  const response = await request(app)
    .post("/items/99/claims")
    .send({ name: "Jordan" });
  assert.equal(
    response.status,
    404,
    `POST /items/99/claims answered ${response.status}.`,
  );
  assert.equal(response.body.detail, "There's no item 99.");
});

test('API 9) GET /lockers answers 404 with detail "There\'s nothing at /lockers."', async () => {
  const response = await request(app).get("/lockers");
  assert.equal(
    response.status,
    404,
    `GET /lockers answered ${response.status}.`,
  );
  assert.equal(response.body.detail, "There's nothing at /lockers.");
});
