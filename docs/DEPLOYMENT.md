# Deployment

The live demonstration is built with Vinext and deployed as a
Cloudflare Worker-compatible site.

## Production build

    npm ci
    npm run build

The deployment output is written under dist.

## Canonical URL

Open Graph and social metadata use the live demonstration URL by default.
Forks can override it at build time:

    NEXT_PUBLIC_SITE_URL=https://your-domain.example npm run build

Use an absolute HTTPS origin without a trailing path.

## Hosting configuration

The file .openai/hosting.json contains an opaque project identifier for the
official live demonstration. It is not a credential, but a fork should not
attempt to reuse it.

Before creating a separate Sites deployment, remove the project_id field while
preserving the d1 and r2 keys:

    {
      "d1": null,
      "r2": null
    }

The current app does not require D1, R2, authentication, secrets, or runtime
environment variables.

## Other Cloudflare-compatible hosting

The entry point is worker/index.ts, and vite.config.ts contains the Worker
bindings used during development and production builds. A different hosting
provider may require adapting that entry point or the emitted dist package.

## Public repository versus live site

Publishing the source on GitHub does not automatically redeploy the live app.
The CI workflow verifies each push and pull request; deployment remains an
explicit maintainer action.
