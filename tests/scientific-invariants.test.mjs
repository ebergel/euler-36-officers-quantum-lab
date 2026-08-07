import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const tolerance = 1e-12;
const zero = () => ({ re: 0, im: 0 });
const add = (left, right) => ({
  re: left.re + right.re,
  im: left.im + right.im,
});
const outer = (left, right) => ({
  re: left.re * right.re + left.im * right.im,
  im: left.im * right.re - left.re * right.im,
});
const magnitude = (value) => Math.hypot(value.re, value.im);

const amplitude = {
  a: 0.5 * Math.sqrt(1 - 1 / Math.sqrt(5)),
  b: 0.5 * Math.sqrt(1 + 1 / Math.sqrt(5)),
  c: 1 / Math.sqrt(2),
};

async function loadQuantumStates({ erasePhases = false } = {}) {
  const source = await readFile(
    new URL("../app/quantum-data.ts", import.meta.url),
    "utf8",
  );
  const calls = [
    ...source.matchAll(
      /q\(\s*(\d)\s*,\s*(\d)\s*,\s*\[(.*?)\]\s*\),/gs,
    ),
  ];

  return calls.map((call) => {
    const row = Number(call[1]);
    const column = Number(call[2]);
    const components = [
      ...call[3].matchAll(
        /\["(\d)(\d)",\s*"(a|b|c)"(?:,\s*(\d+))?\]/g,
      ),
    ].map((component) => {
      const rank = Number(component[1]);
      const regiment = Number(component[2]);
      const amplitudeKey = component[3];
      const phase = erasePhases ? 0 : Number(component[4] ?? 0);
      const angle = (phase * Math.PI) / 10;
      return {
        rank,
        regiment,
        amplitudeKey,
        phase,
        value: {
          re: amplitude[amplitudeKey] * Math.cos(angle),
          im: amplitude[amplitudeKey] * Math.sin(angle),
        },
      };
    });

    const vector = Array.from({ length: 36 }, zero);
    components.forEach((component) => {
      vector[component.rank * 6 + component.regiment] = component.value;
    });

    return { row, column, components, vector };
  });
}

function innerProduct(left, right) {
  let value = zero();
  for (let index = 0; index < 36; index += 1) {
    const product = outer(right[index], left[index]);
    value = add(value, product);
  }
  return value;
}

function maxUnitarityError(matrix) {
  let maximum = 0;
  for (let first = 0; first < 36; first += 1) {
    for (let second = 0; second < 36; second += 1) {
      const actual = innerProduct(matrix[first], matrix[second]);
      const expected = first === second ? 1 : 0;
      maximum = Math.max(
        maximum,
        Math.hypot(actual.re - expected, actual.im),
      );
    }
  }
  return maximum;
}

function flatten(states, cut) {
  const matrix = Array.from({ length: 36 }, () =>
    Array.from({ length: 36 }, zero),
  );

  states.forEach((state) => {
    state.components.forEach((component) => {
      const labels = {
        r: state.row,
        c: state.column,
        a: component.rank,
        b: component.regiment,
      };
      const rowIndex = labels[cut[0][0]] * 6 + labels[cut[0][1]];
      const columnIndex = labels[cut[1][0]] * 6 + labels[cut[1][1]];
      matrix[rowIndex][columnIndex] = component.value;
    });
  });

  return matrix;
}

function maxPartialTraceError(states) {
  const byPosition = new Map(
    states.map((state) => [state.row * 6 + state.column, state]),
  );
  const at = (row, column) => byPosition.get(row * 6 + column);
  let maximum = 0;

  for (const family of ["row", "column"]) {
    for (const tracedSubsystem of ["rank", "regiment"]) {
      for (let firstLine = 0; firstLine < 6; firstLine += 1) {
        for (let secondLine = 0; secondLine < 6; secondLine += 1) {
          for (let firstBasis = 0; firstBasis < 6; firstBasis += 1) {
            for (let secondBasis = 0; secondBasis < 6; secondBasis += 1) {
              let actual = zero();
              for (let position = 0; position < 6; position += 1) {
                const left =
                  family === "row"
                    ? at(firstLine, position)
                    : at(position, firstLine);
                const right =
                  family === "row"
                    ? at(secondLine, position)
                    : at(position, secondLine);

                for (let tracedBasis = 0; tracedBasis < 6; tracedBasis += 1) {
                  const leftIndex =
                    tracedSubsystem === "regiment"
                      ? firstBasis * 6 + tracedBasis
                      : tracedBasis * 6 + firstBasis;
                  const rightIndex =
                    tracedSubsystem === "regiment"
                      ? secondBasis * 6 + tracedBasis
                      : tracedBasis * 6 + secondBasis;
                  actual = add(
                    actual,
                    outer(left.vector[leftIndex], right.vector[rightIndex]),
                  );
                }
              }

              const expected =
                firstLine === secondLine && firstBasis === secondBasis ? 1 : 0;
              maximum = Math.max(
                maximum,
                Math.hypot(actual.re - expected, actual.im),
              );
            }
          }
        }
      }
    }
  }

  return maximum;
}

test("the Golden QOLS data satisfy every published invariant", async () => {
  const states = await loadQuantumStates();
  assert.equal(states.length, 36);
  assert.deepEqual(
    states.map((state) => state.row * 6 + state.column),
    Array.from({ length: 36 }, (_, index) => index),
  );

  const supportHistogram = states.reduce(
    (histogram, state) => {
      histogram[state.components.length] += 1;
      return histogram;
    },
    { 2: 0, 3: 0, 4: 0 },
  );
  assert.deepEqual(supportHistogram, { 2: 8, 3: 16, 4: 12 });

  let maxNormError = 0;
  let maxOverlap = 0;
  for (let first = 0; first < states.length; first += 1) {
    const norm = innerProduct(states[first].vector, states[first].vector);
    maxNormError = Math.max(maxNormError, Math.abs(norm.re - 1), Math.abs(norm.im));
    for (let second = first + 1; second < states.length; second += 1) {
      maxOverlap = Math.max(
        maxOverlap,
        magnitude(innerProduct(states[first].vector, states[second].vector)),
      );
    }
  }

  assert.ok(maxNormError < tolerance, "normalization error " + maxNormError);
  assert.ok(maxOverlap < tolerance, "pair overlap " + maxOverlap);

  const cuts = [
    [["r", "c"], ["a", "b"]],
    [["r", "a"], ["c", "b"]],
    [["r", "b"], ["a", "c"]],
  ];
  cuts.forEach((cut) => {
    const error = maxUnitarityError(flatten(states, cut));
    assert.ok(error < tolerance, "2-unitary cut error " + error);
  });

  const partialTraceError = maxPartialTraceError(states);
  assert.ok(
    partialTraceError < tolerance,
    "partial-trace identity error " + partialTraceError,
  );
});

test("erasing phase preserves norms but destroys distinguishability", async () => {
  const states = await loadQuantumStates({ erasePhases: true });
  let maxNormError = 0;
  let maxOverlap = 0;

  for (let first = 0; first < states.length; first += 1) {
    const norm = innerProduct(states[first].vector, states[first].vector);
    maxNormError = Math.max(maxNormError, Math.abs(norm.re - 1));
    for (let second = first + 1; second < states.length; second += 1) {
      maxOverlap = Math.max(
        maxOverlap,
        magnitude(innerProduct(states[first].vector, states[second].vector)),
      );
    }
  }

  assert.ok(maxNormError < tolerance);
  assert.ok(maxOverlap > 0.1);
});

test("the displayed classical near-square is unique and optimal at cost two", async () => {
  const source = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const block = source.match(
    /const NEAR_SQUARE:[\s\S]*?=\s*\[([\s\S]*?)\]\.map/,
  );
  assert.ok(block, "NEAR_SQUARE data not found");
  const officers = [...block[1].matchAll(/"(\d)(\d)"/g)].map((pair) => [
    Number(pair[1]),
    Number(pair[2]),
  ]);

  assert.equal(officers.length, 36);
  assert.equal(new Set(officers.map((pair) => pair.join(""))).size, 36);

  let score = 0;
  let validChecks = 0;
  const inspect = (indices, attribute) => {
    const distinct = new Set(indices.map((index) => officers[index][attribute]));
    score += 6 - distinct.size;
    if (distinct.size === 6) validChecks += 1;
  };

  for (let line = 0; line < 6; line += 1) {
    const row = Array.from({ length: 6 }, (_, column) => line * 6 + column);
    const column = Array.from({ length: 6 }, (_, rowIndex) => rowIndex * 6 + line);
    inspect(row, 0);
    inspect(row, 1);
    inspect(column, 0);
    inspect(column, 1);
  }

  assert.equal(score, 2);
  assert.equal(validChecks, 22);
});
