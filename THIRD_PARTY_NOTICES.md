# Third-party notices and data provenance

## Golden QOLS(6) state data

The numerical state table in app/quantum-data.ts is adapted from Appendix B of:

Karol Życzkowski, Wojciech Bruzda, Grzegorz Rajchel-Mieldzioć,
Adam Burchardt, Suhail Ahmad Rather, and Arul Lakshminarayan,
“9 × 4 = 6 × 6: Understanding the quantum solution to Euler’s problem of
36 officers,” Journal of Physics: Conference Series 2448, 012003 (2023).

- DOI: https://doi.org/10.1088/1742-6596/2448/1/012003
- Source: https://arxiv.org/abs/2204.06800
- Source version used: arXiv:2204.06800v2
- License: https://creativecommons.org/licenses/by/4.0/

Modifications: the printed formulas were converted to zero-based sparse
TypeScript records; the mathematical coefficients and phase exponents were
preserved; visual color labels were replaced with accessible UI names and
colors. The adapted state-table data remain available under CC BY 4.0.

The original related result is linked rather than redistributed:

Suhail Ahmad Rather, Adam Burchardt, Wojciech Bruzda,
Grzegorz Rajchel-Mieldzioć, Arul Lakshminarayan, and Karol Życzkowski,
“Thirty-six Entangled Officers of Euler: Quantum Solution to a Classically
Impossible Problem,” Physical Review Letters 128, 080507 (2022).

- DOI: https://doi.org/10.1103/PhysRevLett.128.080507
- Source: https://arxiv.org/abs/2104.05122

## Motivating video

The project was motivated by Up and Atom’s video:

[Quantum Physics Found a Loophole in an IMPOSSIBLE Math Problem](https://www.youtube.com/watch?v=SCI8g6EinAo)

The full video transcript used as local development context is not
redistributed in this repository. The video remains under its owner’s terms.

## Social-preview image

public/og.png was generated with OpenAI image-generation tooling for this
project and retains its content-provenance metadata. It is AI-generated, not
human-illustrated. As between the project author and OpenAI, output rights are
assigned under OpenAI’s terms. The project makes the image available under the
MIT License to the extent those rights exist.

## Fonts

The interface requests Geist and Geist Mono through next/font. Geist is
available under the SIL Open Font License 1.1:

https://github.com/vercel/geist-font/blob/main/LICENSE.txt

## Software dependencies

The project depends on the open-source packages recorded in package.json and
package-lock.json. Their respective licenses remain with their authors. They
are not relicensed by this project.

The project-specific Worker, Vite, PostCSS, TypeScript, and ESLint
configuration files were written for this repository against the public APIs
of their respective open-source packages.
