// The Lost and Found Desk's found items and the claims made on them, kept in memory.
// resetData() puts both back the way they start; the tests call it before each test.
const startingItems = [
  { id: 1, name: "Blue water bottle", place: "Library", status: "waiting" },
  { id: 2, name: "Math textbook", place: "Science Hall", status: "waiting" },
  { id: 3, name: "Green umbrella", place: "Cafeteria", status: "claimed" },
  { id: 4, name: "Student ID card", place: "Gym", status: "waiting" },
  { id: 5, name: "Wireless earbuds", place: "Library", status: "claimed" },
];

const startingClaims = [
  { id: 1, itemId: 3, name: "Priya" },
  { id: 2, itemId: 5, name: "Omar" },
];

export const items = [];
export const claims = [];

export function resetData() {
  items.length = 0;
  claims.length = 0;
  for (const item of startingItems) {
    items.push({ ...item });
  }
  for (const claim of startingClaims) {
    claims.push({ ...claim });
  }
}

export function nextClaimId() {
  return Math.max(0, ...claims.map((claim) => claim.id)) + 1;
}

resetData();
