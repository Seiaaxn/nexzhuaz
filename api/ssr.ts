// Vercel serverless function — proxies all requests to the TanStack Start SSR handler.
// The handler is the Web-standard fetch handler emitted by `vite build`.
import server from "../dist/server/server.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  runtime: "nodejs22.x",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Convert Vercel request to Web Request
  const url = new URL(req.url || "", "http://localhost");

  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (typeof value === "string") {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => headers.append(key, v));
    }
  });

  const body = req.body
    ? req.method === "GET" || req.method === "HEAD"
      ? undefined
      : JSON.stringify(req.body)
    : undefined;

  const webRequest = new Request(url.toString(), {
    method: req.method || "GET",
    headers,
    body,
  });

  try {
    const response = await server.fetch(webRequest);

    // Set response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Set status code
    res.status(response.status);

    // Send response body
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value, { stream: true }));
      }
    }

    res.end();
  } catch (error) {
    console.error("SSR Handler Error:", error);
    res.status(500).send("Internal Server Error");
  }
      }
