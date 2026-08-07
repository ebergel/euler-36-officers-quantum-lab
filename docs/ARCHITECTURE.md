# Architecture

Six Refuses is a single-route, client-interactive React application built with
Next-compatible Vinext and emitted as a Cloudflare Worker-compatible site.

## Runtime shape

The app has no application-owned backend, database, account system, analytics,
or durable learner state.

    Browser
      └── app/page.tsx
            ├── deterministic classical constraint analysis
            ├── local Monte Carlo measurement simulations
            ├── quantum-state overlap and marginal calculations
            └── exact state data from app/quantum-data.ts

All learner interaction state lives in React memory. Reloading the page resets
the experiments.

## Key files

### app/page.tsx

Contains the learning sequence and the interactive models:

- navigation and discovery progress;
- classical officer swapping and constraint scoring;
- two-amplitude measurement and recombination;
- product/Bell coefficient matrices;
- idealized CHSH sampling;
- Golden QOLS officer inspection, measurement, phase erasure, and marginals;
- perfect-tensor cut selection.

The simulations are intentionally visible and small enough to audit. Avoid
hiding the mathematical model behind a general simulation framework.

### app/quantum-data.ts

Contains the exact 36 sparse bipartite states from Appendix B of
arXiv:2204.06800. Each component records:

- a two-digit rank/regiment basis label;
- one of the exact amplitude families a, b, or c;
- a phase exponent k representing exp(iπk/10).

Changes to this file require the full invariant suite to pass.

### app/globals.css

Defines the visual system, layout, interaction feedback, responsive
breakpoints, focus indicators, and reduced-motion behavior. The interface uses
CSS rather than illustration dependencies so the scientific state remains the
visual material.

### tests

The server-render test imports the production Worker output and checks essential
content and metadata. The scientific-invariants test parses the same state
records used by the app and verifies their mathematical constraints.

## Build and hosting

Vinext produces the deployment under dist. The custom Sites Vite plugin stages
hosting metadata. The Worker entry point is worker/index.ts.

The checked-in hosting project identifier names the live demonstration and is
not a credential. Fork maintainers should remove or replace it before creating
their own deployment.

## Extension guidelines

- Keep one authoritative copy of scientific data.
- Add deterministic tests before adding explanatory claims.
- Prefer pure functions for new numerical models.
- Keep Monte Carlo sampling separate from analytic expected values.
- Do not introduce persistence unless the learning goal truly requires it.
- Treat accessibility behavior as part of the component contract.
