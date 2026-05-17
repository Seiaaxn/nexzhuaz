// Vercel serverless function — proxies all requests to the TanStack Start SSR handler.
// The handler is the Web-standard fetch handler emitted by `vite build`.
import server from "../dist/server/server.js";

export const config = {
  runtime: "nodejs22.x",
};

export default async function handler(request: Request): Promise<Response> {
  return server.fetch(request);
}
