# Scientific foundations and scope

Six Refuses uses one combinatorial problem to introduce genuine quantum
structure. This document records what the app claims, what it computes, and
which simplifications it deliberately avoids.

## 1. The classical problem

Each of 36 officers has one of six ranks and belongs to one of six regiments,
with every ordered pair used exactly once. The task is to arrange them in a
6×6 square so that every row and column contains each rank and regiment exactly
once.

This is equivalent to a pair of orthogonal Latin squares of order six.
No such pair exists.

The app starts from a 36-officer near-square with conflict cost two. Its score is
defined by summing, over every row, column, and attribute:

    6 − number of distinct values in that line

All 36 ordered pairs are unique. Every row check and every regiment-column check
passes. Exactly two rank-column deficits remain. Cost zero is impossible by the
nonexistence theorem. Cost one is also impossible: because every value occurs
six times globally, five perfect lines force the sixth line to be perfect.
Therefore the displayed cost-two arrangement is optimal.

## 2. States, amplitudes, and phase

A normalized pure state is a complex vector

    |ψ⟩ = Σx αx |x⟩, with Σx |αx|² = 1.

Measuring in the displayed basis produces outcome x with probability |αx|².
Relative phase affects other measurement bases through interference even when
the displayed-basis probabilities stay fixed.

The app does not define superposition as merely “both at once.” It presents a
state operationally: a preparation that supplies amplitudes for possible
measurement outcomes. Interpretations of what that state is ontologically are
not experimental theorems.

Two pure states are perfectly distinguishable exactly when their inner product
vanishes. Different probability profiles are neither necessary nor sufficient;
phase can make states with identical basis histograms orthogonal.

## 3. Tensor products and entanglement

Joint state spaces multiply. Two two-level systems have a four-dimensional
basis: 00, 01, 10, and 11.

A pure bipartite state is entangled when its coefficient matrix cannot be
factored into an outer product of two local vectors. The tensor loom contrasts a
rank-one product state with a rank-two Bell state.

The CHSH game samples the ideal joint distributions:

- the shared-classical-bit strategy wins 75 percent on average;
- the ideal quantum strategy wins cos²(π/8), approximately 85.4 percent.

This is a Monte Carlo of the theoretical distribution, not a connection to
quantum hardware. Each local output remains unbiased, so the correlations do
not provide faster-than-light communication.

## 4. Quantum orthogonal Latin squares

Each quantum officer is a bipartite state in C⁶ ⊗ C⁶:

    |ψrc⟩ = Σab Urc,ab |a,b⟩.

The exact Golden QOLS(6) data in app/quantum-data.ts are transcribed from
Appendix B of the 2022 explanatory paper. The coefficients are

    a = ½√(1 − 1/√5)
    b = ½√(1 + 1/√5)
    c = 1/√2
    ω = exp(iπ/10)

They obey a² + b² = c² = 1/2 and b/a = φ. A phase exponent k means ωᵏ.

The test suite verifies:

- all 36 states normalize;
- all 630 unordered pairs are orthogonal;
- rank and regiment marginals are uniform for every row and column;
- the row and column partial-trace identities hold for both subsystems.

The full rules are stronger than equal probability totals. Erasing the phases
preserves every |amplitude|² while destroying orthogonality and the
off-diagonal cancellations. That interaction is the central scientific point
of the final lab.

## 5. The perfect-tensor view

The four-party state is

    |Ψ⟩ = ⅙ Σrc |r,c⟩ |ψrc⟩.

Pairing the four indices in each of the three possible two-versus-two ways
produces the matrices conventionally written U, Uᴿ, and UΓ. All three are
unitary. Equivalently, the state is AME(4,6): maximally entangled across every
two-versus-two bipartition.

This does not mean every individual pair is entangled like two matching coins.
Every two-party reduced state is maximally mixed; the structure is global.

## 6. Provenance and references

Primary sources:

1. K. Życzkowski et al.,
   [9 × 4 = 6 × 6: Understanding the quantum solution to Euler’s problem of 36 officers](https://arxiv.org/abs/2204.06800)
2. S. A. Rather et al.,
   [Thirty-six entangled officers of Euler: Quantum solution to a classically impossible problem](https://arxiv.org/abs/2104.05122)
3. A. Higuchi and A. Sudbery,
   “How entangled can two couples get?”, Physics Letters A 272 (2000).
4. D. R. Stinson,
   “A short proof of the nonexistence of a pair of orthogonal Latin squares of order six”,
   Journal of Combinatorial Theory, Series A 36 (1984).
5. Up and Atom,
   [Quantum Physics Found a Loophole in an IMPOSSIBLE Math Problem](https://www.youtube.com/watch?v=SCI8g6EinAo)

The project cites rather than redistributes the research PDF and
video-derived transcript used during development. Those works are not covered
by this repository’s MIT License.

The concrete cost-two near-square is included as verified project data; no
claim of original discovery is made. Its uniqueness and score are established
by the deterministic test suite.
