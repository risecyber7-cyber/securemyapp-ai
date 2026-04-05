import { createServer } from "node:http";
import { router } from "./web/router.js";

const port = Number(process.env.PORT || 3000);

const server = createServer(async (req, res) => {
  try {
    await router.handle(req, res);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const payload = {
      error: statusCode === 500 ? "Internal Server Error" : error.message,
    };

    res.writeHead(statusCode, { "content-type": "application/json" });
    res.end(JSON.stringify(payload));
  }
});

server.listen(port, () => {
  console.log(`SecureMyApp AI listening on http://localhost:${port}`);
});
