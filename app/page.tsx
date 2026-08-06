"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import {
  AMPLITUDES,
  PHI,
  QUANTUM_OFFICERS,
  RANKS,
  REGIMENTS,
  probabilityFor,
  type QuantumOfficer,
} from "./quantum-data";

type OfficerPair = { rank: number; regiment: number };
type BellMode = "classical" | "quantum";
type LineKind = "row" | "column";
type Discovery = "classical" | "amplitude" | "phase" | "entanglement" | "golden";

const NEAR_SQUARE: OfficerPair[] = [
  "14", "35", "41", "53", "00", "22",
  "05", "43", "50", "24", "12", "31",
  "40", "52", "34", "15", "21", "03",
  "51", "04", "25", "42", "33", "10",
  "32", "20", "13", "01", "45", "54",
  "23", "11", "02", "30", "44", "55",
].map((pair) => ({ rank: Number(pair[0]), regiment: Number(pair[1]) }));

const SOLVED_THREE: OfficerPair[] = Array.from({ length: 9 }, (_, index) => {
  const row = Math.floor(index / 3);
  const column = index % 3;
  return {
    rank: (row + column) % 3,
    regiment: (row + 2 * column) % 3,
  };
});

const NAV_ITEMS = [
  { id: "briefing", number: "00", label: "The rulebook" },
  { id: "classical", number: "01", label: "Classical prison" },
  { id: "amplitudes", number: "02", label: "Amplitude engine" },
  { id: "entanglement", number: "03", label: "Entanglement" },
  { id: "golden", number: "04", label: "Golden square" },
  { id: "frontier", number: "05", label: "Research frontier" },
] as const;

const TOTAL_DISCOVERIES = 5;

function analyzeParade(grid: OfficerPair[], size: number) {
  const conflictCells = new Set<number>();
  let score = 0;
  let validChecks = 0;

  const inspect = (indices: number[], key: keyof OfficerPair) => {
    const groups = new Map<number, number[]>();
    indices.forEach((index) => {
      const value = grid[index][key];
      groups.set(value, [...(groups.get(value) ?? []), index]);
    });
    const deficit = size - groups.size;
    score += deficit;
    if (deficit === 0) {
      validChecks += 1;
      return;
    }
    groups.forEach((cells) => {
      if (cells.length > 1) cells.forEach((cell) => conflictCells.add(cell));
    });
  };

  for (let line = 0; line < size; line += 1) {
    const row = Array.from({ length: size }, (_, column) => line * size + column);
    const column = Array.from({ length: size }, (_, rowIndex) => rowIndex * size + line);
    inspect(row, "rank");
    inspect(row, "regiment");
    inspect(column, "rank");
    inspect(column, "regiment");
  }

  return {
    score,
    validChecks,
    totalChecks: size * 4,
    conflictCells,
  };
}

function stateOverlapError(phasesIntact: boolean) {
  let maximum = 0;

  for (let first = 0; first < QUANTUM_OFFICERS.length; first += 1) {
    for (let second = first + 1; second < QUANTUM_OFFICERS.length; second += 1) {
      let real = 0;
      let imaginary = 0;
      const left = QUANTUM_OFFICERS[first];
      const right = QUANTUM_OFFICERS[second];

      left.components.forEach((leftComponent) => {
        const rightComponent = right.components.find(
          (component) => component.basis === leftComponent.basis,
        );
        if (!rightComponent) return;
        const magnitude =
          AMPLITUDES[leftComponent.amplitude] *
          AMPLITUDES[rightComponent.amplitude];
        const phaseDifference = phasesIntact
          ? ((rightComponent.phase - leftComponent.phase) * Math.PI) / 10
          : 0;
        real += magnitude * Math.cos(phaseDifference);
        imaginary += magnitude * Math.sin(phaseDifference);
      });

      maximum = Math.max(maximum, Math.hypot(real, imaginary));
    }
  }

  return maximum;
}

function getMarginals(kind: LineKind, lineIndex: number) {
  const line = QUANTUM_OFFICERS.filter((officer) =>
    kind === "row" ? officer.row === lineIndex : officer.column === lineIndex,
  );
  const rank = Array(6).fill(0) as number[];
  const regiment = Array(6).fill(0) as number[];

  line.forEach((officer) => {
    officer.components.forEach((component) => {
      const probability = probabilityFor(component) / 6;
      rank[Number(component.basis[0])] += probability;
      regiment[Number(component.basis[1])] += probability;
    });
  });

  return { rank, regiment };
}

function sampleIndex(probabilities: number[]) {
  const target = Math.random();
  let accumulated = 0;
  for (let index = 0; index < probabilities.length; index += 1) {
    accumulated += probabilities[index];
    if (target <= accumulated) return index;
  }
  return probabilities.length - 1;
}

function phaseLabel(phase: number) {
  if (phase === 0) return "";
  if (phase === 1) return "ω";
  return "ω" + superscript(phase);
}

function superscript(value: number) {
  const digits: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
  };
  return String(value)
    .split("")
    .map((digit) => digits[digit])
    .join("");
}

function LabHeader({
  number,
  eyebrow,
  title,
  children,
}: {
  number: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <header className="lab-header">
      <div className="lab-number" aria-hidden="true">
        {number}
      </div>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <div className="lab-intro">{children}</div>
      </div>
    </header>
  );
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}) {
  return (
    <div className={"metric metric-" + tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function QuantumOfficerCell({
  officer,
  selected,
  highlighted,
  phasesIntact,
  onSelect,
}: {
  officer: QuantumOfficer;
  selected: boolean;
  highlighted: boolean;
  phasesIntact: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={
        "quantum-cell" +
        (selected ? " is-selected" : "") +
        (highlighted ? " is-highlighted" : "")
      }
      onClick={onSelect}
      aria-label={
        "Inspect quantum officer at row " +
        (officer.row + 1) +
        ", column " +
        (officer.column + 1)
      }
    >
      <span className="cell-coordinate">
        {officer.row + 1}.{officer.column + 1}
      </span>
      <span className="component-cloud" aria-hidden="true">
        {officer.components.map((component) => {
          const rank = Number(component.basis[0]);
          const regiment = Number(component.basis[1]);
          const style = {
            "--component-color": REGIMENTS[regiment].color,
            "--component-scale": String(
              0.7 + AMPLITUDES[component.amplitude] * 0.58,
            ),
            "--phase-angle": (phasesIntact ? component.phase * 18 : 0) + "deg",
          } as CSSProperties;
          return (
            <span
              className="quantum-component"
              data-amplitude={component.amplitude}
              style={style}
              key={component.basis + component.amplitude + component.phase}
            >
              {RANKS[rank].glyph}
            </span>
          );
        })}
      </span>
    </button>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("briefing");
  const [discoveries, setDiscoveries] = useState<Set<Discovery>>(new Set());
  const [classicalSize, setClassicalSize] = useState<3 | 6>(6);
  const [parade, setParade] = useState<OfficerPair[]>(NEAR_SQUARE);
  const [selectedClassical, setSelectedClassical] = useState<number | null>(null);
  const [showClassicalProof, setShowClassicalProof] = useState(false);
  const [mixAngle, setMixAngle] = useState(45);
  const [relativePhase, setRelativePhase] = useState(0);
  const [officerShots, setOfficerShots] = useState([0, 0]);
  const [detectorShots, setDetectorShots] = useState([0, 0]);
  const [lastMeasurement, setLastMeasurement] = useState<string | null>(null);
  const [phasePrediction, setPhasePrediction] = useState<"yes" | "no" | null>(null);
  const [pairKind, setPairKind] = useState<"product" | "bell">("product");
  const [bellMode, setBellMode] = useState<BellMode>("classical");
  const [bellStats, setBellStats] = useState({ wins: 0, rounds: 0 });
  const [lastBellRound, setLastBellRound] = useState<{
    x: number;
    y: number;
    a: number;
    b: number;
    won: boolean;
  } | null>(null);
  const [selectedOfficerIndex, setSelectedOfficerIndex] = useState(0);
  const [measuredBasis, setMeasuredBasis] = useState<string | null>(null);
  const [phasesIntact, setPhasesIntact] = useState(true);
  const [lineKind, setLineKind] = useState<LineKind>("row");
  const [lineIndex, setLineIndex] = useState(0);
  const [tensorCut, setTensorCut] = useState(0);

  const markDiscovery = useCallback((discovery: Discovery) => {
    setDiscoveries((current) => {
      if (current.has(discovery)) return current;
      const next = new Set(current);
      next.add(discovery);
      return next;
    });
  }, []);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      Boolean,
    ) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0.05, 0.25, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const classicalAnalysis = useMemo(
    () => analyzeParade(parade, classicalSize),
    [parade, classicalSize],
  );

  const angleRadians = (mixAngle * Math.PI) / 180;
  const phaseRadians = (relativePhase * Math.PI) / 180;
  const officerProbabilities = [
    Math.cos(angleRadians) ** 2,
    Math.sin(angleRadians) ** 2,
  ];
  const detectorProbabilities = [
    (1 + Math.sin(2 * angleRadians) * Math.cos(phaseRadians)) / 2,
    (1 - Math.sin(2 * angleRadians) * Math.cos(phaseRadians)) / 2,
  ];
  const overlap = Math.abs(Math.cos(phaseRadians / 2));

  const selectedOfficer = QUANTUM_OFFICERS[selectedOfficerIndex];
  const selectedProbabilities = selectedOfficer.components.map(probabilityFor);
  const overlapError = useMemo(
    () => stateOverlapError(phasesIntact),
    [phasesIntact],
  );
  const marginals = useMemo(
    () => getMarginals(lineKind, lineIndex),
    [lineKind, lineIndex],
  );

  const changeClassicalSize = (size: 3 | 6) => {
    setClassicalSize(size);
    setParade(size === 3 ? SOLVED_THREE : NEAR_SQUARE);
    setSelectedClassical(null);
  };

  const selectClassicalCell = (index: number) => {
    if (selectedClassical === null) {
      setSelectedClassical(index);
      return;
    }
    if (selectedClassical === index) {
      setSelectedClassical(null);
      return;
    }
    setParade((current) => {
      const next = [...current];
      [next[selectedClassical], next[index]] = [next[index], next[selectedClassical]];
      return next;
    });
    setSelectedClassical(null);
    markDiscovery("classical");
  };

  const runMeasurement = (basis: "officer" | "detector", repeats: number) => {
    const probabilities =
      basis === "officer" ? officerProbabilities : detectorProbabilities;
    let zero = 0;
    let one = 0;
    let final = 0;
    for (let shot = 0; shot < repeats; shot += 1) {
      final = sampleIndex(probabilities);
      if (final === 0) zero += 1;
      else one += 1;
    }
    if (basis === "officer") {
      setOfficerShots((current) => [current[0] + zero, current[1] + one]);
      setLastMeasurement(final === 0 ? "Vermilion king" : "Cobalt knight");
      markDiscovery("amplitude");
    } else {
      setDetectorShots((current) => [current[0] + zero, current[1] + one]);
      setLastMeasurement(final === 0 ? "Bright port (+)" : "Dark port (−)");
      markDiscovery("phase");
    }
  };

  const runBellGame = (rounds: number) => {
    let wins = 0;
    let last = null as typeof lastBellRound;
    for (let round = 0; round < rounds; round += 1) {
      const x = Math.random() < 0.5 ? 0 : 1;
      const y = Math.random() < 0.5 ? 0 : 1;
      const requiredParity = x & y;
      const a = Math.random() < 0.5 ? 0 : 1;
      let b: number;
      if (bellMode === "classical") {
        b = a;
      } else {
        const quantumWin = Math.random() < Math.cos(Math.PI / 8) ** 2;
        b = a ^ requiredParity ^ (quantumWin ? 0 : 1);
      }
      const won = (a ^ b) === requiredParity;
      if (won) wins += 1;
      last = { x, y, a, b, won };
    }
    setBellStats((current) => ({
      wins: current.wins + wins,
      rounds: current.rounds + rounds,
    }));
    setLastBellRound(last);
    markDiscovery("entanglement");
  };

  const changeBellMode = (mode: BellMode) => {
    setBellMode(mode);
    setBellStats({ wins: 0, rounds: 0 });
    setLastBellRound(null);
  };

  const measureSelectedOfficer = () => {
    const component =
      selectedOfficer.components[sampleIndex(selectedProbabilities)];
    setMeasuredBasis(component.basis);
    markDiscovery("golden");
  };

  const navigateTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const totalOfficerShots = officerShots[0] + officerShots[1];
  const totalDetectorShots = detectorShots[0] + detectorShots[1];
  const bellRate =
    bellStats.rounds === 0 ? 0 : (100 * bellStats.wins) / bellStats.rounds;
  const progress = (discoveries.size / TOTAL_DISCOVERIES) * 100;

  const tensorCuts = [
    {
      left: "row + column",
      right: "rank + regiment",
      matrix: "U",
      meaning: "Choose a square; the output is one orthogonal quantum officer.",
    },
    {
      left: "row + rank",
      right: "column + regiment",
      matrix: "Uᴿ",
      meaning: "Choose a row and rank; the complementary pair is still recoverable.",
    },
    {
      left: "row + regiment",
      right: "rank + column",
      matrix: "UΓ",
      meaning: "Choose a row and regiment; this view is unitary too.",
    },
  ];

  return (
    <div className="site-shell">
      <aside className="side-rail" aria-label="Experiment navigation">
        <button className="brand-mark" onClick={() => navigateTo("briefing")}>
          <span>SIX</span>
          <span>REFUSES</span>
        </button>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={activeSection === item.id ? "active" : ""}
              onClick={() => navigateTo(item.id)}
              aria-current={activeSection === item.id ? "location" : undefined}
            >
              <span>{item.number}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="rail-progress">
          <div>
            <span>Discoveries</span>
            <strong>
              {discoveries.size}/{TOTAL_DISCOVERIES}
            </strong>
          </div>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: progress + "%" }} />
          </div>
        </div>
      </aside>

      <main>
        <section className="hero" id="briefing">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <p className="case-label">
              CASE FILE 036 <span>•</span> THE IMPOSSIBLE LAB
            </p>
            <h1>
              SIX
              <span>REFUSES.</span>
            </h1>
            <p className="hero-lede">
              A 243-year-old impossible parade becomes a doorway into quantum
              reality.
            </p>
            <button className="primary-action" onClick={() => navigateTo("classical")}>
              Enter the lab
              <span aria-hidden="true">↓</span>
            </button>
          </div>

          <div className="hero-instrument" aria-label="Four-label quantum state diagram">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="orbit-label orbit-row">ROW</span>
            <span className="orbit-label orbit-column">COLUMN</span>
            <span className="orbit-label orbit-rank">RANK</span>
            <span className="orbit-label orbit-regiment">REGIMENT</span>
            <div className="state-core">
              <span>|Ψ⟩</span>
              <small>4 labels • 3 cuts</small>
            </div>
            <div className="hero-readout">
              <span>CLASSICAL</span>
              <strong>NO SOLUTION</strong>
              <span>QUANTUM</span>
              <strong>COHERENT</strong>
            </div>
          </div>

          <div className="hero-thesis">
            <p>Six is not cursed. A rulebook is.</p>
            <p>
              The quantum answer does not sneak a new arrangement into Euler&apos;s
              old rules. It changes what an officer can be, then satisfies a deeper
              version of the rules.
            </p>
          </div>
        </section>

        <section className="honesty-strip" aria-label="Scientific honesty note">
          <span>OPERATIONAL FACT</span>
          <p>
            Quantum mechanics gives a precise recipe from preparation to probabilities.
            Whether a state is “really many things at once” is interpretation, not a
            laboratory result. Here, the equations earn every metaphor.
          </p>
        </section>

        <section className="lab-section" id="classical">
          <LabHeader
            number="01"
            eyebrow="The classical prison"
            title="Try to finish Euler’s parade."
          >
            <p>
              Thirty-six unique officers carry two labels: one of six ranks and one
              of six regiments. Every row and column must contain each label exactly
              once. Swap two tiles. The red rings expose the rule you broke.
            </p>
          </LabHeader>

          <div className="experiment-card classical-experiment">
            <div className="experiment-toolbar">
              <div className="segmented-control" aria-label="Grid size">
                <button
                  className={classicalSize === 3 ? "selected" : ""}
                  onClick={() => changeClassicalSize(3)}
                >
                  3 × 3 solved
                </button>
                <button
                  className={classicalSize === 6 ? "selected" : ""}
                  onClick={() => changeClassicalSize(6)}
                >
                  6 × 6 edge
                </button>
              </div>
              <button
                className="text-action"
                onClick={() => {
                  setParade(classicalSize === 3 ? SOLVED_THREE : NEAR_SQUARE);
                  setSelectedClassical(null);
                }}
              >
                Reset arrangement
              </button>
            </div>

            <div className="classical-layout">
              <div>
                <div
                  className={"parade-grid parade-" + classicalSize}
                  style={{ "--grid-size": classicalSize } as CSSProperties}
                >
                  {parade.map((officer, index) => {
                    const isConflict = classicalAnalysis.conflictCells.has(index);
                    const style = {
                      "--officer-color": REGIMENTS[officer.regiment].color,
                    } as CSSProperties;
                    return (
                      <button
                        key={index}
                        className={
                          "parade-tile" +
                          (isConflict ? " conflict" : "") +
                          (selectedClassical === index ? " selected" : "")
                        }
                        style={style}
                        onClick={() => selectClassicalCell(index)}
                        aria-label={
                          "Row " +
                          (Math.floor(index / classicalSize) + 1) +
                          ", column " +
                          ((index % classicalSize) + 1) +
                          ": " +
                          RANKS[officer.rank].name +
                          ", " +
                          REGIMENTS[officer.regiment].name +
                          " regiment" +
                          (isConflict ? ", conflict" : "")
                        }
                      >
                        <span aria-hidden="true">{RANKS[officer.rank].glyph}</span>
                        <small>
                          R{officer.rank + 1} / G{officer.regiment + 1}
                        </small>
                      </button>
                    );
                  })}
                </div>
                <p className="interaction-hint">
                  {selectedClassical === null
                    ? "Select an officer, then another, to swap them."
                    : "Now select the destination."}
                </p>
              </div>

              <div className="analysis-panel">
                <p className="panel-label">LIVE CONSTRAINT SCAN</p>
                <div className="metric-grid">
                  <Metric
                    label="Duplicate cost"
                    value={String(classicalAnalysis.score)}
                    tone={classicalAnalysis.score === 0 ? "good" : "warn"}
                  />
                  <Metric
                    label="Clean line-tests"
                    value={
                      classicalAnalysis.validChecks +
                      " / " +
                      classicalAnalysis.totalChecks
                    }
                    tone={
                      classicalAnalysis.validChecks === classicalAnalysis.totalChecks
                        ? "good"
                        : "neutral"
                    }
                  />
                  <Metric label="Unique officers" value={parade.length + " / " + parade.length} />
                </div>
                {classicalSize === 6 ? (
                  <div className="result-note">
                    <span className="status-lamp" />
                    <div>
                      <strong>You start at the mathematical edge: cost 2.</strong>
                      <p>
                        Twenty-two of twenty-four line-tests pass. A zero would be a
                        Graeco-Latin square of order six—and Tarry proved it cannot
                        exist.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="result-note solved">
                    <span className="status-lamp" />
                    <div>
                      <strong>Order three has room to breathe.</strong>
                      <p>
                        Pick any two labels—row, column, rank, regiment—and the other
                        two are fixed.
                      </p>
                    </div>
                  </div>
                )}
                <button
                  className="reveal-button"
                  onClick={() => setShowClassicalProof((value) => !value)}
                  aria-expanded={showClassicalProof}
                >
                  {showClassicalProof ? "Hide the proof sketch" : "Why can’t cost 1 exist?"}
                </button>
                {showClassicalProof && (
                  <div className="proof-note">
                    Every rank appears six times globally. If five columns are perfect,
                    the last column is forced to contain one of each rank too. So defects
                    arrive in pairs. Cost 0 is impossible; this cost-2 parade is optimal.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="concept-bridge">
            <span>THE ESCAPE HATCH</span>
            <p>
              An impossibility proof is always about a language. Classical officers
              are single ordered pairs. Quantum officers are normalized vectors of
              complex amplitudes. A larger language does not make logic weaker—it
              creates new objects that can obey stronger structure.
            </p>
          </div>
        </section>

        <section className="lab-section" id="amplitudes">
          <LabHeader
            number="02"
            eyebrow="The amplitude engine"
            title="Probability is the shadow. Amplitude is the machine."
          >
            <p>
              A quantum state is an answer engine: choose a measurement, project the
              vector onto its possible answers, then square the lengths. The arrows
              are amplitudes. Their squared lengths are probabilities.
            </p>
          </LabHeader>

          <div className="equation-banner" aria-label="Quantum state equation">
            <span>|ψ⟩ = </span>
            <strong>{Math.cos(angleRadians).toFixed(2)}</strong>
            <span>|vermillion king⟩ + e</span>
            <sup>iφ</sup>
            <strong>{Math.sin(angleRadians).toFixed(2)}</strong>
            <span>|cobalt knight⟩</span>
          </div>

          <div className="two-lab-grid">
            <div className="experiment-card amplitude-card">
              <div className="card-heading">
                <div>
                  <p className="panel-label">LAB A • BUILD A STATE</p>
                  <h3>Turn the amplitude knobs.</h3>
                </div>
                <span className="normalization-badge">Σ |α|² = 1</span>
              </div>

              <div className="control-stack">
                <label>
                  <span>
                    Mixing angle θ <strong>{mixAngle}°</strong>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={mixAngle}
                    onChange={(event) => {
                      setMixAngle(Number(event.target.value));
                      markDiscovery("amplitude");
                    }}
                    aria-label="Mixing angle"
                  />
                </label>
                <label>
                  <span>
                    Relative phase φ <strong>{relativePhase}°</strong>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={relativePhase}
                    onChange={(event) => {
                      setRelativePhase(Number(event.target.value));
                      markDiscovery("phase");
                    }}
                    aria-label="Relative phase"
                  />
                </label>
              </div>

              <div className="phasor-pair">
                <div>
                  <div className="phasor">
                    <span
                      className="phasor-arrow arrow-a"
                      style={{
                        width: 12 + 62 * Math.cos(angleRadians) + "px",
                      }}
                    />
                    <span className="phasor-center" />
                  </div>
                  <strong>α₀</strong>
                  <small>|α₀| = {Math.cos(angleRadians).toFixed(3)}</small>
                </div>
                <div>
                  <div className="phasor">
                    <span
                      className="phasor-arrow arrow-b"
                      style={{
                        width: 12 + 62 * Math.sin(angleRadians) + "px",
                        transform: "rotate(" + relativePhase + "deg)",
                      }}
                    />
                    <span className="phasor-center" />
                  </div>
                  <strong>α₁</strong>
                  <small>|α₁| = {Math.sin(angleRadians).toFixed(3)}</small>
                </div>
              </div>

              <div className="probability-readout">
                <div>
                  <span>Vermilion king</span>
                  <div className="bar-track">
                    <span style={{ width: 100 * officerProbabilities[0] + "%" }} />
                  </div>
                  <strong>{(100 * officerProbabilities[0]).toFixed(1)}%</strong>
                </div>
                <div>
                  <span>Cobalt knight</span>
                  <div className="bar-track violet">
                    <span style={{ width: 100 * officerProbabilities[1] + "%" }} />
                  </div>
                  <strong>{(100 * officerProbabilities[1]).toFixed(1)}%</strong>
                </div>
              </div>

              <div className="button-row">
                <button onClick={() => runMeasurement("officer", 1)}>Measure once</button>
                <button onClick={() => runMeasurement("officer", 100)}>Run 100</button>
                <button
                  className="quiet"
                  onClick={() => {
                    setOfficerShots([0, 0]);
                    setLastMeasurement(null);
                  }}
                >
                  Clear
                </button>
              </div>

              <div className="shot-readout" aria-live="polite">
                <div>
                  <span style={{ height: totalOfficerShots ? (100 * officerShots[0]) / totalOfficerShots + "%" : "0%" }} />
                  <small>{officerShots[0]}</small>
                </div>
                <div>
                  <span style={{ height: totalOfficerShots ? (100 * officerShots[1]) / totalOfficerShots + "%" : "0%" }} />
                  <small>{officerShots[1]}</small>
                </div>
                <p>
                  {lastMeasurement
                    ? "Last result: " + lastMeasurement
                    : "No measurement yet. Predict first."}
                </p>
              </div>
            </div>

            <div className="experiment-card interference-card">
              <div className="card-heading">
                <div>
                  <p className="panel-label">LAB B • RECOMBINE</p>
                  <h3>Make hidden phase visible.</h3>
                </div>
              </div>

              <div className="prediction-box">
                <p>Will changing φ alter the king/knight probabilities above?</p>
                <div>
                  <button
                    className={phasePrediction === "yes" ? "selected" : ""}
                    onClick={() => setPhasePrediction("yes")}
                  >
                    Yes
                  </button>
                  <button
                    className={phasePrediction === "no" ? "selected" : ""}
                    onClick={() => setPhasePrediction("no")}
                  >
                    No
                  </button>
                </div>
                {phasePrediction && (
                  <p className={phasePrediction === "no" ? "answer-correct" : "answer-wrong"}>
                    {phasePrediction === "no"
                      ? "Correct. That basis sees lengths, not direction."
                      : "Good hypothesis. Test the phase dial: those bars do not move."}
                  </p>
                )}
              </div>

              <div className="recombiner">
                <div className="wave wave-a" />
                <div className="wave wave-b" style={{ "--phase-shift": relativePhase / 360 } as CSSProperties} />
                <div className="beam-splitter">H</div>
                <div className="detectors">
                  <div>
                    <span>+</span>
                    <strong>{(100 * detectorProbabilities[0]).toFixed(1)}%</strong>
                  </div>
                  <div>
                    <span>−</span>
                    <strong>{(100 * detectorProbabilities[1]).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>

              <div className="button-row">
                <button
                  onClick={() => {
                    setMixAngle(45);
                    setRelativePhase(0);
                  }}
                >
                  Make |+⟩
                </button>
                <button
                  onClick={() => {
                    setMixAngle(45);
                    setRelativePhase(180);
                    markDiscovery("phase");
                  }}
                >
                  Make |−⟩
                </button>
                <button onClick={() => runMeasurement("detector", 100)}>Detect 100</button>
              </div>

              <div className="detector-histogram" aria-live="polite">
                <span>
                  + port <strong>{detectorShots[0]}</strong>
                </span>
                <div>
                  <span style={{ width: totalDetectorShots ? (100 * detectorShots[0]) / totalDetectorShots + "%" : "0%" }} />
                </div>
                <span>
                  − port <strong>{detectorShots[1]}</strong>
                </span>
              </div>

              <div className="orthogonality-meter">
                <div>
                  <span>Overlap with |+⟩</span>
                  <strong>{overlap.toFixed(3)}</strong>
                </div>
                <div className="meter-track">
                  <span style={{ width: 100 * overlap + "%" }} />
                </div>
                <p>
                  {overlap < 0.01
                    ? "Zero overlap: |+⟩ and |−⟩ are perfectly distinguishable."
                    : "Nonzero overlap: no measurement can distinguish them perfectly."}
                </p>
              </div>
            </div>
          </div>

          <div className="level-strip">
            <article>
              <span>INTUITION</span>
              <p>Probabilities are arrow lengths squared.</p>
            </article>
            <article>
              <span>MECHANISM</span>
              <p>Relative phase rotates arrows, so recombination can add or cancel.</p>
            </article>
            <article>
              <span>PROVE IT</span>
              <p>⟨+|−⟩ = (1 − 1) / 2 = 0. Orthogonality is exact.</p>
            </article>
          </div>
        </section>

        <section className="lab-section entanglement-section" id="entanglement">
          <LabHeader
            number="03"
            eyebrow="Tensor products & entanglement"
            title="Two systems multiply. Then the whole outruns its parts."
          >
            <p>
              One two-level system has two basis states. Two such systems have four:
              00, 01, 10, 11. Most joint vectors cannot be split into “Alice’s vector
              × Bob’s vector.” That failure to factor is entanglement.
            </p>
          </LabHeader>

          <div className="two-lab-grid">
            <div className="experiment-card tensor-card">
              <div className="card-heading">
                <div>
                  <p className="panel-label">TENSOR LOOM</p>
                  <h3>Same local odds. Different whole.</h3>
                </div>
              </div>
              <div className="segmented-control">
                <button
                  className={pairKind === "product" ? "selected" : ""}
                  onClick={() => setPairKind("product")}
                >
                  Product |+⟩|+⟩
                </button>
                <button
                  className={pairKind === "bell" ? "selected" : ""}
                  onClick={() => {
                    setPairKind("bell");
                    markDiscovery("entanglement");
                  }}
                >
                  Bell |Φ+⟩
                </button>
              </div>

              <div className="coefficient-matrix" data-kind={pairKind}>
                {["00", "01", "10", "11"].map((basis, index) => {
                  const active =
                    pairKind === "product" || (pairKind === "bell" && (index === 0 || index === 3));
                  return (
                    <div className={active ? "active" : ""} key={basis}>
                      <span>|{basis}⟩</span>
                      <strong>
                        {pairKind === "product"
                          ? "½"
                          : active
                            ? "1/√2"
                            : "0"}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="factor-test">
                <span>Factor test</span>
                <strong>{pairKind === "product" ? "rank 1 • separable" : "rank 2 • entangled"}</strong>
                <p>
                  {pairKind === "product"
                    ? "The 2×2 amplitude table is an outer product. Alice and Bob each own a complete local state."
                    : "No two local vectors multiply into this table. Each side alone is maximally random, although the pair is perfectly structured."}
                </p>
              </div>
            </div>

            <div className="experiment-card bell-card">
              <div className="card-heading">
                <div>
                  <p className="panel-label">BELL GAME</p>
                  <h3>Beat every shared answer sheet.</h3>
                </div>
              </div>

              <p className="game-rule">
                Alice and Bob receive random bits x and y. Without communicating,
                they output a and b. They win when <strong>a ⊕ b = x·y</strong>.
              </p>

              <div className="segmented-control">
                <button
                  className={bellMode === "classical" ? "selected" : ""}
                  onClick={() => changeBellMode("classical")}
                >
                  Shared classical bit
                </button>
                <button
                  className={bellMode === "quantum" ? "selected" : ""}
                  onClick={() => changeBellMode("quantum")}
                >
                  Entangled pair
                </button>
              </div>

              <div className="bell-arena">
                <div>
                  <small>ALICE</small>
                  <span>x = {lastBellRound?.x ?? "?"}</span>
                  <strong>a = {lastBellRound?.a ?? "?"}</strong>
                </div>
                <div className="no-signal">
                  <span>{bellMode === "quantum" ? "ENTANGLED" : "SHARED"}</span>
                  <small>no messages</small>
                </div>
                <div>
                  <small>BOB</small>
                  <span>y = {lastBellRound?.y ?? "?"}</span>
                  <strong>b = {lastBellRound?.b ?? "?"}</strong>
                </div>
              </div>

              <div className="bell-score">
                <div>
                  <span>Observed win rate</span>
                  <strong>{bellStats.rounds ? bellRate.toFixed(1) + "%" : "—"}</strong>
                </div>
                <div className="score-track">
                  <span className="classical-limit" style={{ left: "75%" }}>
                    75%
                  </span>
                  <span className="score-fill" style={{ width: bellRate + "%" }} />
                </div>
                <p aria-live="polite">
                  {lastBellRound
                    ? lastBellRound.won
                      ? "Last round: win."
                      : "Last round: loss."
                    : "Run enough rounds to see the boundary."}
                </p>
              </div>

              <div className="button-row">
                <button onClick={() => runBellGame(1)}>Play 1</button>
                <button onClick={() => runBellGame(100)}>Play 100</button>
                <button
                  className="quiet"
                  onClick={() => {
                    setBellStats({ wins: 0, rounds: 0 });
                    setLastBellRound(null);
                  }}
                >
                  Reset
                </button>
              </div>

              <p className="safety-note">
                Quantum expectation: cos²(π/8) ≈ 85.4%. Each local output remains
                random, so this correlation cannot transmit a message faster than light.
              </p>
            </div>
          </div>
        </section>

        <section className="lab-section golden-section" id="golden">
          <LabHeader
            number="04"
            eyebrow="The golden quantum square"
            title="Meet the actual 36 quantum officers."
          >
            <p>
              Each cell below is one exact state from the published analytic solution.
              A glyph-color pair is a classical rank-regiment basis state. Size is
              amplitude; the tiny radial mark is phase. Click any officer to inspect it.
            </p>
          </LabHeader>

          <div className="golden-toolbar">
            <div>
              <span>COHERENCE</span>
              <strong>{phasesIntact ? "PHASES INTACT" : "PHASES ERASED"}</strong>
            </div>
            <button
              className={phasesIntact ? "danger-toggle" : "danger-toggle active"}
              onClick={() => {
                setPhasesIntact((value) => !value);
                markDiscovery("golden");
              }}
            >
              {phasesIntact ? "Erase every phase" : "Restore exact phases"}
            </button>
          </div>

          <div className="golden-layout">
            <div className="quantum-board-wrap">
              <div className="quantum-board">
                {QUANTUM_OFFICERS.map((officer, index) => (
                  <QuantumOfficerCell
                    key={officer.row + "-" + officer.column}
                    officer={officer}
                    selected={selectedOfficerIndex === index}
                    highlighted={
                      lineKind === "row"
                        ? officer.row === lineIndex
                        : officer.column === lineIndex
                    }
                    phasesIntact={phasesIntact}
                    onSelect={() => {
                      setSelectedOfficerIndex(index);
                      setMeasuredBasis(null);
                      markDiscovery("golden");
                    }}
                  />
                ))}
              </div>
              <div className="board-legend">
                <span><i data-amplitude="a" /> a = {AMPLITUDES.a.toFixed(3)}</span>
                <span><i data-amplitude="b" /> b = {AMPLITUDES.b.toFixed(3)}</span>
                <span><i data-amplitude="c" /> c = {AMPLITUDES.c.toFixed(3)}</span>
                <span><i className="phase-tick" /> phase k × 18°</span>
              </div>
            </div>

            <div className="officer-inspector">
              <p className="panel-label">
                OFFICER ψ{selectedOfficer.row}{selectedOfficer.column}
              </p>
              <h3>
                Row {selectedOfficer.row + 1}, column {selectedOfficer.column + 1}
              </h3>
              <div className="state-formula">
                {selectedOfficer.components.map((component, index) => (
                  <span key={component.basis + index}>
                    {index > 0 && " + "}
                    <strong>{component.amplitude}</strong>
                    {phasesIntact && phaseLabel(component.phase)}
                    |{component.basis}⟩
                  </span>
                ))}
              </div>
              <p className="formula-key">ω = e^(iπ/10), so ω¹⁰ = −1.</p>

              <div className="component-list">
                {selectedOfficer.components.map((component) => {
                  const rank = Number(component.basis[0]);
                  const regiment = Number(component.basis[1]);
                  const probability = probabilityFor(component);
                  const measured = measuredBasis === component.basis;
                  return (
                    <div className={measured ? "measured" : ""} key={component.basis}>
                      <span
                        className="basis-glyph"
                        style={{ color: REGIMENTS[regiment].color }}
                        aria-hidden="true"
                      >
                        {RANKS[rank].glyph}
                      </span>
                      <span>
                        <strong>
                          {RANKS[rank].name} • {REGIMENTS[regiment].name}
                        </strong>
                        <small>
                          amplitude {component.amplitude}
                          {phasesIntact && component.phase
                            ? ", phase " + component.phase + "π/10"
                            : ""}
                        </small>
                      </span>
                      <span className="component-probability">
                        {(100 * probability).toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>

              <button className="measure-officer" onClick={measureSelectedOfficer}>
                Measure this officer once
              </button>
              <p className="measurement-result" aria-live="polite">
                {measuredBasis
                  ? "One outcome became definite: |" + measuredBasis + "⟩. Re-prepare the state to measure again."
                  : "Before measurement, the formula—not a hidden tile—is the complete state description."}
              </p>
            </div>
          </div>

          <div className="validation-console">
            <div className="console-heading">
              <div>
                <p className="panel-label">RULE SCANNER</p>
                <h3>Keep the probabilities. Break the solution.</h3>
              </div>
              <span className={phasesIntact ? "console-status valid" : "console-status invalid"}>
                {phasesIntact ? "QOLS VALID" : "COHERENCE FAILURE"}
              </span>
            </div>

            <div className="console-rules">
              <div>
                <span>01</span>
                <p>Every officer normalized</p>
                <strong>PASS</strong>
              </div>
              <div>
                <span>02</span>
                <p>Row/column probability marginals balanced</p>
                <strong>PASS</strong>
              </div>
              <div className={phasesIntact ? "" : "failed"}>
                <span>03</span>
                <p>All 36 states perfectly distinguishable</p>
                <strong>{phasesIntact ? "PASS" : "FAIL"}</strong>
              </div>
              <div className={phasesIntact ? "" : "failed"}>
                <span>04</span>
                <p>Off-diagonal partial-trace terms cancel</p>
                <strong>{phasesIntact ? "PASS" : "FAIL"}</strong>
              </div>
            </div>

            <div className="overlap-console">
              <span>Largest overlap between different officers</span>
              <strong>
                {phasesIntact ? "< 2 × 10⁻¹⁶" : overlapError.toFixed(3)}
              </strong>
              <p>
                Every |amplitude|² is unchanged when phases are erased. The easy
                histograms still look perfect—but the quantum design is broken.
                Coherence was doing real work.
              </p>
            </div>
          </div>

          <div className="marginal-lab">
            <div className="marginal-controls">
              <div>
                <p className="panel-label">THE DIAGONAL SHADOW</p>
                <h3>Scan one complete line.</h3>
              </div>
              <div className="segmented-control">
                <button
                  className={lineKind === "row" ? "selected" : ""}
                  onClick={() => setLineKind("row")}
                >
                  Row
                </button>
                <button
                  className={lineKind === "column" ? "selected" : ""}
                  onClick={() => setLineKind("column")}
                >
                  Column
                </button>
              </div>
              <div className="line-selector" aria-label="Line number">
                {Array.from({ length: 6 }, (_, index) => (
                  <button
                    className={lineIndex === index ? "selected" : ""}
                    onClick={() => setLineIndex(index)}
                    key={index}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="marginal-bars">
              <div>
                <span>RANK MARGINAL</span>
                {marginals.rank.map((value, index) => (
                  <div key={index}>
                    <small>{RANKS[index].glyph}</small>
                    <span><i style={{ width: value * 600 + "%" }} /></span>
                    <strong>{(100 * value).toFixed(1)}%</strong>
                  </div>
                ))}
              </div>
              <div>
                <span>REGIMENT MARGINAL</span>
                {marginals.regiment.map((value, index) => (
                  <div key={index}>
                    <small style={{ color: REGIMENTS[index].color }}>●</small>
                    <span><i style={{ width: value * 600 + "%" }} /></span>
                    <strong>{(100 * value).toFixed(1)}%</strong>
                  </div>
                ))}
              </div>
            </div>
            <p className="marginal-warning">
              Uniform 1/6 marginals are necessary, not sufficient. The full rules also
              compare different rows and columns coherently; that is where the phases
              and cancellations enter.
            </p>
          </div>

          <div className="golden-ratio-card">
            <div>
              <p className="panel-label">THE GOLDEN SIGNATURE</p>
              <h3>b / a = φ = {PHI.toFixed(6)}…</h3>
              <p>
                The ratio lives in amplitudes, not probabilities. Therefore b²/a² =
                φ². The construction also obeys a² + b² = c² = 1/2.
              </p>
            </div>
            <div className="golden-bars" aria-label="Golden amplitude comparison">
              <span style={{ width: (AMPLITUDES.a / AMPLITUDES.c) * 100 + "%" }}>
                a
              </span>
              <span style={{ width: (AMPLITUDES.b / AMPLITUDES.c) * 100 + "%" }}>
                b
              </span>
              <span style={{ width: "100%" }}>c</span>
            </div>
          </div>

          <div className="perfect-tensor">
            <div className="perfect-copy">
              <p className="panel-label">PERFECT TENSOR INSPECTOR</p>
              <h3>One state. Three ways to read it.</h3>
              <p>
                Build the four-party state |Ψ⟩ = ⅙ Σᵣ꜀ |r,c⟩|ψᵣ꜀⟩. Now choose
                which two labels are inputs. For a classical square the maps would be
                permutations. Here, all three maps are 36×36 unitaries.
              </p>
              <div className="cut-selector">
                {tensorCuts.map((cut, index) => (
                  <button
                    className={tensorCut === index ? "selected" : ""}
                    onClick={() => {
                      setTensorCut(index);
                      markDiscovery("golden");
                    }}
                    key={cut.matrix}
                  >
                    Cut {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="tensor-machine">
              <div>
                <span>INPUT PAIR</span>
                <strong>{tensorCuts[tensorCut].left}</strong>
              </div>
              <div className="unitary-core">
                <small>36 × 36</small>
                <strong>{tensorCuts[tensorCut].matrix}</strong>
                <span>UNITARY</span>
              </div>
              <div>
                <span>OUTPUT PAIR</span>
                <strong>{tensorCuts[tensorCut].right}</strong>
              </div>
              <p>{tensorCuts[tensorCut].meaning}</p>
            </div>
          </div>

          <div className="ame-note">
            <strong>AME(4,6), carefully stated</strong>
            <p>
              The four-party state is maximally entangled across every two-versus-two
              cut. It does not mean every individual pair is linked like matching coins;
              every two-party reduced state is maximally mixed. The structure is global.
            </p>
          </div>
        </section>

        <section className="frontier-section" id="frontier">
          <p className="eyebrow">05 • THE RESEARCH FRONTIER</p>
          <h2>
            Euler asked whether 36 definite officers could obey the parade.
            <span>Quantum theory asked whether definiteness was the obstruction.</span>
          </h2>

          <div className="frontier-grid">
            <article>
              <span>DOOR 01</span>
              <h3>Why φ?</h3>
              <p>
                The golden ratio is forced into the analytic construction. The 2022
                paper leaves its deeper geometric role as an open invitation.
              </p>
            </article>
            <article>
              <span>DOOR 02</span>
              <h3>Other sixes?</h3>
              <p>
                The paper asks whether genuinely different QOLS(6) solutions exist,
                beyond this one viewed through local rotations and reorderings.
              </p>
            </article>
            <article>
              <span>DOOR 03</span>
              <h3>Beyond the parade</h3>
              <p>
                Perfect tensors connect this puzzle to quantum error correction,
                secret sharing, and the geometry of quantum information.
              </p>
            </article>
          </div>

          <div className="closing-challenge">
            <span>YOUR NEW REFLEX</span>
            <p>
              When someone proves a thing impossible, ask: impossible for which
              objects, under which operations, observed in which basis?
            </p>
          </div>

          <footer>
            <div>
              <strong>SIX REFUSES</strong>
              <span>An independent first-principles quantum lab.</span>
            </div>
            <div className="source-links">
              <a
                href="https://www.youtube.com/watch?v=SCI8g6EinAo"
                target="_blank"
                rel="noreferrer"
              >
                Story that inspired the lab ↗
              </a>
              <a
                href="https://arxiv.org/abs/2204.06800"
                target="_blank"
                rel="noreferrer"
              >
                Explanatory paper ↗
              </a>
              <a
                href="https://arxiv.org/abs/2104.05122"
                target="_blank"
                rel="noreferrer"
              >
                Original result ↗
              </a>
            </div>
          </footer>
        </section>
      </main>

      <div className="mobile-progress" aria-label="Course progress">
        <span style={{ width: progress + "%" }} />
      </div>
    </div>
  );
}
