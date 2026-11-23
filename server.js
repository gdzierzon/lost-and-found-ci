// Starts the Lost and Found Desk's API at http://localhost:3100 (or the port in the PORT environment variable).
// Run it with: npm start (or npm run dev, which restarts it each time you save). Stop it with Ctrl+C.
import { app } from "./app.js";

const port = process.env.PORT ?? 3100;

app.listen(port, () => {
  console.log(`The Lost and Found Desk's API is on http://localhost:${port}`);
});
