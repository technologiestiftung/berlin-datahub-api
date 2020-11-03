import { server } from "./server";
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  process.stdout.write(`Listening on http://localhost:${PORT}\n`);
});
