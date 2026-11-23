// The Lost and Found Desk's API: the finished version, lint clean and formatted.
// Every request below answers exactly as it did in the starter: the fixes changed how the code is written, not what
// it does.
//
// Every error answer has the API's one shape:
//   { "status": 404, "title": "Not Found", "detail": "There's no item 99." }
//
//   GET  /items                 200, every item in items.js
//   GET  /items?status=waiting  200, only the items whose status is "waiting" (the same for "claimed")
//   GET  /items/2               200, item 2 (every item's id works the same way)
//   GET  /items/99              404, detail "There's no item 99."
//
//   POST /items/1/claims        body { "name": "Jordan" }: 201, the new claim { id, itemId: 1, name: "Jordan" },
//                               added to claims, and item 1's status becomes "claimed"
//                               404 when there's no such item: detail "There's no item 99."
//                               400 when name is missing or empty: detail "The claim isn't valid.",
//                                 problems [{ "field": "name", "message": "name is required." }]
//                               409 when the item is already claimed: detail "Item 3 has already been claimed."
//
//   GET  /lockers               404, detail "There's nothing at /lockers." (any path no route answers)
//   A body that isn't valid JSON: 400, detail "The body isn't valid JSON."
import express from "express";
import { STATUS_CODES } from "node:http";
import { items, claims, nextClaimId } from "./items.js";

export const app = express();
app.use(express.json());

function sendProblem(res, status, detail, problems) {
  const body = { status, title: STATUS_CODES[status], detail };
  if (problems !== undefined) {
    body.problems = problems;
  }
  res.status(status).json(body);
}

function findItem(id) {
  return items.find((item) => item.id === Number(id));
}

app.get("/items", (req, res) => {
  if (req.query.status === undefined) {
    res.json(items);
    return;
  }
  res.json(items.filter((item) => item.status === req.query.status));
});

app.get("/items/:id", (req, res) => {
  const item = findItem(req.params.id);
  if (item === undefined) {
    sendProblem(res, 404, `There's no item ${req.params.id}.`);
    return;
  }
  res.json(item);
});

app.post("/items/:id/claims", (req, res) => {
  const item = findItem(req.params.id);
  if (item === undefined) {
    sendProblem(res, 404, `There's no item ${req.params.id}.`);
    return;
  }
  const name = req.body?.name;
  if (typeof name !== "string" || name.trim() === "") {
    sendProblem(res, 400, "The claim isn't valid.", [
      { field: "name", message: "name is required." },
    ]);
    return;
  }
  if (item.status === "claimed") {
    sendProblem(res, 409, `Item ${item.id} has already been claimed.`);
    return;
  }
  const claim = { id: nextClaimId(), itemId: item.id, name: name.trim() };
  claims.push(claim);
  item.status = "claimed";
  res.status(201).json(claim);
});

// After every route: only the requests no route answered get here.
app.use((req, res) => {
  sendProblem(res, 404, `There's nothing at ${req.path}.`);
});

// Last of all: Express hands every error to a function with four parameters, so _next stays, unused.
app.use((err, req, res, _next) => {
  if (err.type === "entity.parse.failed") {
    sendProblem(res, 400, "The body isn't valid JSON.");
    return;
  }
  console.error(err);
  sendProblem(res, 500, "Something went wrong on our side.");
});
