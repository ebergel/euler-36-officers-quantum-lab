export type AmplitudeKey = "a" | "b" | "c";

/**
 * DATA ATTRIBUTION
 *
 * The Golden QOLS(6) state table in this file is adapted from Appendix B of:
 * Karol Życzkowski, Wojciech Bruzda, Grzegorz Rajchel-Mieldzioć,
 * Adam Burchardt, Suhail Ahmad Rather, and Arul Lakshminarayan,
 * “9 × 4 = 6 × 6: Understanding the quantum solution to Euler’s problem
 * of 36 officers,” J. Phys.: Conf. Ser. 2448 012003 (2023),
 * https://doi.org/10.1088/1742-6596/2448/1/012003,
 * arXiv:2204.06800v2.
 *
 * Source license: Creative Commons Attribution 4.0 International
 * https://creativecommons.org/licenses/by/4.0/
 *
 * Modifications: converted the printed formulas into zero-based sparse
 * TypeScript records; preserved mathematical coefficients and phase exponents;
 * replaced the paper's visual color labels with accessible UI names and colors.
 * The adapted state-table data remain available under CC BY 4.0. The
 * surrounding implementation is licensed separately under MIT.
 */

export type QuantumComponent = {
  basis: `${number}${number}`;
  amplitude: AmplitudeKey;
  phase: number;
};

export type QuantumOfficer = {
  row: number;
  column: number;
  components: QuantumComponent[];
};

export const PHI = (1 + Math.sqrt(5)) / 2;

export const AMPLITUDES: Record<AmplitudeKey, number> = {
  a: 0.5 * Math.sqrt(1 - 1 / Math.sqrt(5)),
  b: 0.5 * Math.sqrt(1 + 1 / Math.sqrt(5)),
  c: 1 / Math.sqrt(2),
};

export const RANKS = [
  { name: "King", glyph: "♔" },
  { name: "Queen", glyph: "♕" },
  { name: "Knight", glyph: "♘" },
  { name: "Bishop", glyph: "♗" },
  { name: "Rook", glyph: "♖" },
  { name: "Pawn", glyph: "♙" },
] as const;

export const REGIMENTS = [
  { name: "Vermilion", color: "#ff6b5f" },
  { name: "Cyan", color: "#52d8e8" },
  { name: "Viridian", color: "#66db8b" },
  { name: "Magenta", color: "#ef72cf" },
  { name: "Cobalt", color: "#7689ff" },
  { name: "Gold", color: "#f5c95b" },
] as const;

const q = (
  row: number,
  column: number,
  components: Array<[`${number}${number}`, AmplitudeKey, number?]>,
): QuantumOfficer => ({
  row,
  column,
  components: components.map(([basis, amplitude, phase = 0]) => ({
    basis,
    amplitude,
    phase,
  })),
});

// A phase k means exp(iπk/10).
export const QUANTUM_OFFICERS: QuantumOfficer[] = [
  q(0, 0, [["10", "c"], ["43", "a", 3], ["53", "b"]]),
  q(0, 1, [["00", "c"], ["43", "b"], ["53", "a", 7]]),
  q(0, 2, [["01", "c", 17], ["24", "b"], ["34", "a", 5]]),
  q(0, 3, [["11", "c", 19], ["24", "a", 5], ["34", "b"]]),
  q(0, 4, [["25", "b", 14], ["35", "a", 15], ["42", "a", 18], ["52", "b", 3]]),
  q(0, 5, [["25", "a", 1], ["35", "b", 12], ["42", "b", 3], ["52", "a", 18]]),

  q(1, 0, [["23", "c", 10], ["50", "c", 10]]),
  q(1, 1, [["33", "c", 6], ["40", "c"]]),
  q(1, 2, [["04", "a", 2], ["14", "b", 5], ["41", "c", 7]]),
  q(1, 3, [["04", "b", 1], ["14", "a", 14], ["51", "c", 19]]),
  q(1, 4, [["05", "b", 4], ["15", "a", 9], ["22", "a", 2], ["32", "b", 13]]),
  q(1, 5, [["05", "a", 3], ["15", "b", 18], ["22", "b", 19], ["32", "a"]]),

  q(2, 0, [["31", "c", 2], ["44", "c", 13]]),
  q(2, 1, [["21", "c", 2], ["54", "c", 7]]),
  q(2, 2, [["12", "c", 19], ["45", "a", 12], ["55", "b", 1]]),
  q(2, 3, [["02", "c", 5], ["45", "b", 15], ["55", "a", 14]]),
  q(2, 4, [["03", "a", 1], ["13", "b", 4], ["20", "c", 8]]),
  q(2, 5, [["03", "b", 10], ["13", "a", 3], ["30", "c", 16]]),

  q(3, 0, [["01", "b", 10], ["11", "a", 15], ["24", "a", 4], ["34", "b", 7]]),
  q(3, 1, [["01", "a", 5], ["11", "b"], ["24", "b", 17], ["34", "a", 10]]),
  q(3, 2, [["25", "a"], ["35", "b", 15], ["42", "b", 14], ["52", "a", 13]]),
  q(3, 3, [["25", "b", 15], ["35", "a"], ["42", "a", 7], ["52", "b", 16]]),
  q(3, 4, [["00", "a", 1], ["10", "b", 16], ["43", "b", 10], ["53", "a", 5]]),
  q(3, 5, [["00", "b", 14], ["10", "a", 19], ["43", "a", 5], ["53", "b", 10]]),

  q(4, 0, [["05", "c"], ["22", "b", 7], ["32", "a"]]),
  q(4, 1, [["15", "c"], ["22", "a", 10], ["32", "b", 13]]),
  q(4, 2, [["23", "c"], ["50", "c", 10]]),
  q(4, 3, [["33", "c", 10], ["40", "c", 14]]),
  q(4, 4, [["04", "b", 2], ["14", "a", 15], ["51", "c", 10]]),
  q(4, 5, [["04", "a", 5], ["14", "b", 8], ["41", "c"]]),

  q(5, 0, [["02", "a", 10], ["12", "b", 5], ["45", "b", 9], ["55", "a", 16]]),
  q(5, 1, [["02", "b", 15], ["12", "a"], ["45", "a", 16], ["55", "b", 13]]),
  q(5, 2, [["03", "b", 14], ["13", "a", 7], ["30", "c", 10]]),
  q(5, 3, [["03", "a", 3], ["13", "b", 6], ["20", "c"]]),
  q(5, 4, [["31", "c"], ["44", "c", 1]]),
  q(5, 5, [["21", "c", 16], ["54", "c", 11]]),
];

export const getOfficer = (row: number, column: number) =>
  QUANTUM_OFFICERS[row * 6 + column];

export const probabilityFor = (component: QuantumComponent) =>
  AMPLITUDES[component.amplitude] ** 2;
