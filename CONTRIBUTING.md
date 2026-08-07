# Contributing to Six Refuses

Thank you for helping make difficult quantum ideas more honest, tangible, and
inviting.

## Before opening a pull request

For a bug, accessibility problem, or small documentation correction, open an
issue or submit a focused pull request. For a new lab, major visual change, or
change to scientific claims, open a proposal issue first so the learning goal
and validation plan can be discussed before implementation.

By contributing, you agree that your contribution may be distributed under the
project’s MIT License.

## Local setup

Requirements: Node.js 22.13 or newer and npm.

    git clone https://github.com/ebergel/six-refuses.git
    cd six-refuses
    npm ci
    npm run dev

No environment variables or external services are required.

## Development checks

Run all checks before requesting review:

    npm run lint
    npm run typecheck
    npm test

The test command includes a production build. Mathematical changes must include
deterministic invariant tests; a screenshot is not evidence of correctness.

## What makes a good learning interaction

A new interaction should answer one precise learner question and include:

1. a prediction or manipulable hypothesis;
2. a variable the learner controls;
3. an observable consequence;
4. the mathematical invariant or equation underneath it;
5. an explicit statement of the model’s limits;
6. keyboard-accessible controls and non-color-only feedback;
7. deterministic tests for the scientific claim.

Avoid metaphor without a falsifiable interaction. Preserve these distinctions:

- amplitude versus probability;
- coherent superposition versus classical uncertainty;
- correlation versus communication;
- nonfactorability versus vague “connectedness”;
- pairwise correlation versus entanglement across a bipartition;
- a quantum generalization versus a classical solution.

Read [docs/TEACHING.md](docs/TEACHING.md) and
[docs/SCIENCE.md](docs/SCIENCE.md) before changing educational content.

## Code style

- Prefer plain React and CSS over new dependencies.
- Keep simulations deterministic in tests and transparent in the interface.
- Use semantic HTML, visible focus states, useful accessible names, and a
  reduced-motion path.
- Keep layout usable from 360-pixel mobile screens through large desktops.
- Explain non-obvious mathematics close to the code that implements it.
- Do not commit generated build output, credentials, local research inputs, or
  third-party PDFs and transcripts.

## Pull request checklist

- [ ] The change has one clear learner or maintainer goal.
- [ ] Scientific claims are sourced and scoped.
- [ ] Interactive controls are keyboard accessible.
- [ ] Meaning is not communicated by color alone.
- [ ] New mathematical behavior has deterministic tests.
- [ ] Documentation is updated.
- [ ] npm run lint passes.
- [ ] npm run typecheck passes.
- [ ] npm test passes.

## Reporting security issues

Do not open a public issue for a vulnerability. Follow
[SECURITY.md](SECURITY.md).
