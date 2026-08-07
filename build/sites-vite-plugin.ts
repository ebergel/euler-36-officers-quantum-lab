import { copyFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import type { Plugin } from "vite";

/**
 * Copy the small, non-secret Sites manifest next to the compiled Worker.
 *
 * This project does not use database migrations or object storage, so the
 * deployment package only needs the hosting manifest.
 */
export function includeSitesManifest(): Plugin {
  return {
    name: "six-refuses-sites-manifest",
    apply: "build",
    async closeBundle() {
      const projectRoot = process.cwd();
      const outputDirectory = join(projectRoot, "dist", ".openai");

      await rm(outputDirectory, { recursive: true, force: true });
      await mkdir(outputDirectory, { recursive: true });
      await copyFile(
        join(projectRoot, ".openai", "hosting.json"),
        join(outputDirectory, "hosting.json"),
      );
    },
  };
}
