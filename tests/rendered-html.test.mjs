import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", String(process.pid) + "-" + String(Date.now()));
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Six Refuses learning lab", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Six Refuses — The Impossible Quantum Lab<\/title>/i);
  assert.match(html, /SIX/);
  assert.match(html, /REFUSES/);
  assert.match(html, /Try to finish Euler/);
  assert.match(html, /Probability is the shadow/);
  assert.match(html, /Meet the actual 36 quantum officers/);
  assert.match(html, /PERFECT TENSOR INSPECTOR/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Starter Project/i);
});

test("ships the exact 36-state golden construction", async () => {
  const data = await readFile(
    new URL("../app/quantum-data.ts", import.meta.url),
    "utf8",
  );
  const stateRows = [...data.matchAll(/\bq\(\d,\s*\d,\s*\[/g)];
  assert.equal(stateRows.length, 36);
  assert.match(data, /export const PHI/);
  assert.match(data, /phase k means exp\(iπk\/10\)/);
  assert.match(data, /q\(5, 5,/);
});

test("removes the disposable starter preview", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview|codex-preview/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
