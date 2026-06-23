import "dotenv/config";
import app from "./app.js";
import { registerEventHandlers } from "./bootstrap/eventHandlers.js";

// Register the event handlers to the event bus
registerEventHandlers();

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});