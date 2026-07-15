import { ErliClient } from "../src/index.js";

const apiKey = process.env.ERLI_API_KEY;
if (!apiKey) {
  throw new Error("Set ERLI_API_KEY before running this example.");
}

const erli = new ErliClient({
  apiKey,
  userAgent: "ErliRestClientExample/0.1.0 (+https://github.com/CichockiAdrian/erli-rest-client-ts)"
});

const inbox = await erli.inbox.list();
console.log(inbox);
