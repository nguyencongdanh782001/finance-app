import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

const port = process.env.PORT || 3000;

export const isSwaggerEnabled = () => {
  if (process.env.ENABLE_SWAGGER === "true") {
    return true;
  }

  // Development and Vercel Preview deployments should expose the docs by
  // default. Production remains opt-in through ENABLE_SWAGGER.
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview"
  );
};

export async function getOpenApiDocument() {
  const document = parse(
    await readFile(path.join(process.cwd(), "docs", "swagger.yaml"), "utf8"),
  ) as Record<string, unknown>;
  const appUrl = process.env.APP_URL || `http://localhost:${port}`;

  document.info = {
    ...(document.info as Record<string, unknown>),
    title: "Quỳnh Nhi Store API",
    description: "API documentation for Quỳnh Nhi Store",
    version: "1.0",
  };
  document.servers = [{ url: appUrl }];

  return document;
}
