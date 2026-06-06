import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
    Activity,
    BarChart3,
    Bot,
    ChevronRight,
    ClipboardList,
    Compass,
    Download,
    FileDown,
    Focus,
    Github,
    HelpCircle,
    History,
    Import,
    Instagram,
    Layers3,
    Linkedin,
    Lock,
    Maximize2,
    Mic,
    Moon,
    Play,
    Radar,
    Redo2,
    RotateCcw,
    Save,
    Share2,
    ShieldCheck,
    Sparkles,
    Sun,
    Target,
    Undo2,
    Unlock,
    Users,
    Wand2,
    X,
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Bar,
    BarChart,
    PolarAngleAxis,
    PolarGrid,
    RadarChart,
    Radar as RadarShape,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type Point = { x: number; y: number };

type Player = {
  id: number;
  name: string;
  role: string;
  skill: number;
  catching: number;
  throwing: number;
  speed: number;
  preferred: string[];
  color: string;
};

type Fielder = Player & Point;

type MatchContext = {
  battingHand: "Right Handed" | "Left Handed";
  battingStyle: "Aggressive" | "Anchor" | "Power Hitter" | "Finisher";
  bowlerType:
    | "Fast"
    | "Swing"
    | "Seam"
    | "Off Spinner"
    | "Leg Spinner"
    | "Left Arm Orthodox"
    | "Mystery Spinner";
  pitch: "Flat" | "Green" | "Dusty" | "Turning" | "Wet";
  format: "T10" | "T20" | "ODI" | "Test";
  phase: "Powerplay" | "Middle Overs" | "Death Overs";
};

type Shot = {
  name: string;
  path: Point[];
  risk: number;
  zone: string;
};

type Analysis = {
  scores: Record<string, number>;
  weakZones: string[];
  gaps: string[];
  misplaced: string[];
  risks: string[];
  recommendations: string[];
};

const players: Player[] = [
  {
    id: 1,
    name: "Player 1",
    role: "Captain",
    skill: 94,
    catching: 88,
    throwing: 83,
    speed: 78,
    preferred: ["Slip", "Mid Off"],
    color: "#22d3ee",
  },
  {
    id: 2,
    name: "Player 2",
    role: "Ring Fielder",
    skill: 96,
    catching: 91,
    throwing: 89,
    speed: 86,
    preferred: ["Cover", "Long On"],
    color: "#f43f5e",
  },
  {
    id: 3,
    name: "Player 3",
    role: "Close Catcher",
    skill: 89,
    catching: 84,
    throwing: 78,
    speed: 82,
    preferred: ["Point", "Gully"],
    color: "#a3e635",
  },
  {
    id: 4,
    name: "Player 4",
    role: "Boundary Rider",
    skill: 91,
    catching: 87,
    throwing: 84,
    speed: 92,
    preferred: ["Deep Square Leg", "Fine Leg"],
    color: "#f59e0b",
  },
  {
    id: 5,
    name: "Player 5",
    role: "All-rounder",
    skill: 90,
    catching: 83,
    throwing: 93,
    speed: 88,
    preferred: ["Midwicket", "Long Off"],
    color: "#38bdf8",
  },
  {
    id: 6,
    name: "Player 6",
    role: "Elite Sweeper",
    skill: 95,
    catching: 92,
    throwing: 98,
    speed: 90,
    preferred: ["Point", "Deep Cover"],
    color: "#34d399",
  },
  {
    id: 7,
    name: "Player 7",
    role: "Bowler",
    skill: 93,
    catching: 78,
    throwing: 82,
    speed: 77,
    preferred: ["Fine Leg", "Third Man"],
    color: "#818cf8",
  },
  {
    id: 8,
    name: "Player 8",
    role: "Pacer",
    skill: 87,
    catching: 80,
    throwing: 86,
    speed: 84,
    preferred: ["Mid On", "Fine Leg"],
    color: "#fb7185",
  },
  {
    id: 9,
    name: "Player 9",
    role: "Keeper",
    skill: 88,
    catching: 94,
    throwing: 80,
    speed: 76,
    preferred: ["Keeper", "Slip"],
    color: "#facc15",
  },
  {
    id: 10,
    name: "Player 10",
    role: "Spinner",
    skill: 84,
    catching: 82,
    throwing: 84,
    speed: 80,
    preferred: ["Silly Point", "Short Leg"],
    color: "#2dd4bf",
  },
  {
    id: 11,
    name: "Player 11",
    role: "Outfielder",
    skill: 86,
    catching: 81,
    throwing: 85,
    speed: 93,
    preferred: ["Deep Point", "Long On"],
    color: "#c084fc",
  },
];

const initialFielders: Fielder[] = [
  { ...players[0], x: -10, y: 18 },
  { ...players[1], x: 30, y: -18 },
  { ...players[2], x: 38, y: 10 },
  { ...players[3], x: -56, y: -58 },
  { ...players[4], x: -28, y: -25 },
  { ...players[5], x: 58, y: -40 },
  { ...players[6], x: 2, y: -31 }, // Bowler at bowler's end
  { ...players[7], x: -34, y: 30 },
  { ...players[8], x: 0, y: 48 }, // Keeper behind wickets
  { ...players[9], x: 10, y: 7 },
  { ...players[10], x: -70, y: 42 },
];

const presets: Record<string, Point[]> = {
  "Test Match Attack": [
    { x: -11, y: 15 },
    { x: -15, y: 17 },
    { x: -19, y: 19 },
    { x: 18, y: 15 },
    { x: 35, y: 8 },
    { x: 28, y: -18 },
    { x: 2, y: -31 }, // Bowler
    { x: -25, y: -20 },
    { x: 0, y: 48 }, // Keeper (Fast)
    { x: 6, y: 8 },
    { x: 65, y: 55 },
  ],
  "Swing Attack": [
    { x: -10, y: 16 },
    { x: -14, y: 18 },
    { x: 24, y: 11 },
    { x: 36, y: 3 },
    { x: 30, y: -18 },
    { x: -28, y: -18 },
    { x: 2, y: -31 }, // Bowler
    { x: 62, y: 52 },
    { x: 0, y: 48 }, // Keeper (Fast)
    { x: -62, y: 36 },
    { x: 72, y: -38 },
  ],
  "New Ball Setup": [
    { x: -10, y: 15 },
    { x: -15, y: 18 },
    { x: 18, y: 13 },
    { x: 36, y: 4 },
    { x: 28, y: -20 },
    { x: -28, y: -20 },
    { x: 2, y: -31 }, // Bowler
    { x: 66, y: 58 },
    { x: 0, y: 48 }, // Keeper (Fast)
    { x: -66, y: 42 },
    { x: -68, y: -52 },
  ],
  "Off Spin Trap": [
    { x: 7, y: 7 },
    { x: 14, y: 5 },
    { x: 22, y: 10 },
    { x: 28, y: -12 },
    { x: 42, y: 3 },
    { x: -18, y: -18 },
    { x: 2, y: -31 }, // Bowler
    { x: -40, y: -18 },
    { x: 0, y: 35 }, // Keeper (Close for Spin)
    { x: -60, y: -42 },
    { x: 55, y: 44 },
  ],
  "Leg Spin Trap": [
    { x: -8, y: 8 },
    { x: -15, y: 12 },
    { x: 12, y: 6 },
    { x: 26, y: 12 },
    { x: 36, y: -10 },
    { x: -24, y: -22 },
    { x: 2, y: -31 }, // Bowler
    { x: -44, y: -6 },
    { x: 0, y: 35 }, // Keeper (Close for Spin)
    { x: -62, y: -36 },
    { x: 62, y: 46 },
  ],
  "Powerplay Aggressive": [
    { x: -10, y: 16 },
    { x: 18, y: 12 },
    { x: 34, y: 8 },
    { x: 28, y: -18 },
    { x: -26, y: -20 },
    { x: -38, y: -12 },
    { x: 2, y: -31 }, // Bowler
    { x: 42, y: -26 },
    { x: 0, y: 48 }, // Keeper (Fast)
    { x: -45, y: 22 },
    { x: 58, y: 40 },
  ],
  "Powerplay Defensive": [
    { x: -12, y: 14 },
    { x: 34, y: 2 },
    { x: 50, y: 18 },
    { x: 44, y: -28 },
    { x: -46, y: -28 },
    { x: -48, y: 18 },
    { x: 2, y: -31 }, // Bowler
    { x: 65, y: -40 },
    { x: 0, y: 48 }, // Keeper (Fast)
    { x: -65, y: 40 },
    { x: 68, y: 48 },
  ],
  "Middle Overs Choke": [
    { x: 22, y: 8 },
    { x: 38, y: 0 },
    { x: 35, y: -20 },
    { x: 16, y: -30 },
    { x: -20, y: -28 },
    { x: -36, y: -12 },
    { x: 2, y: -31 }, // Bowler
    { x: -34, y: 16 },
    { x: 0, y: 42 }, // Keeper (Medium)
    { x: 56, y: 34 },
    { x: -58, y: 34 },
  ],
  "Death Overs Protection": [
    { x: 80, y: 10 },
    { x: 72, y: -42 },
    { x: 42, y: -72 },
    { x: -15, y: -82 },
    { x: -72, y: -46 },
    { x: -80, y: 8 },
    { x: 2, y: -31 }, // Bowler
    { x: -58, y: 60 },
    { x: 0, y: 48 }, // Keeper (Fast)
    { x: 58, y: 62 },
    { x: -18, y: -14 },
  ],
};

const shots: Shot[] = [
  {
    name: "Cover Drive",
    path: [
      { x: 0, y: 0 },
      { x: 22, y: -16 },
      { x: 76, y: -54 },
    ],
    risk: 41,
    zone: "Extra Cover",
  },
  {
    name: "Straight Drive",
    path: [
      { x: 0, y: 0 },
      { x: 0, y: -26 },
      { x: 0, y: -92 },
    ],
    risk: 35,
    zone: "Long Off / Long On",
  },
  {
    name: "Pull Shot",
    path: [
      { x: 0, y: 0 },
      { x: -28, y: -10 },
      { x: -84, y: -32 },
    ],
    risk: 63,
    zone: "Deep Midwicket",
  },
  {
    name: "Hook Shot",
    path: [
      { x: 0, y: 0 },
      { x: -32, y: 12 },
      { x: -86, y: 40 },
    ],
    risk: 72,
    zone: "Fine Leg",
  },
  {
    name: "Sweep",
    path: [
      { x: 0, y: 0 },
      { x: -26, y: 20 },
      { x: -76, y: 55 },
    ],
    risk: 58,
    zone: "Deep Square Leg",
  },
  {
    name: "Reverse Sweep",
    path: [
      { x: 0, y: 0 },
      { x: 26, y: 22 },
      { x: 80, y: 52 },
    ],
    risk: 69,
    zone: "Third Man",
  },
  {
    name: "Cut Shot",
    path: [
      { x: 0, y: 0 },
      { x: 36, y: 10 },
      { x: 92, y: 26 },
    ],
    risk: 46,
    zone: "Deep Point",
  },
  {
    name: "Lofted Drive",
    path: [
      { x: 0, y: 0 },
      { x: 20, y: -30 },
      { x: 48, y: -88 },
    ],
    risk: 78,
    zone: "Long Off",
  },
  {
    name: "Paddle Scoop",
    path: [
      { x: 0, y: 0 },
      { x: -10, y: 30 },
      { x: -28, y: 92 },
    ],
    risk: 67,
    zone: "Fine Leg",
  },
  {
    name: "Upper Cut",
    path: [
      { x: 0, y: 0 },
      { x: 34, y: 30 },
      { x: 86, y: 76 },
    ],
    risk: 74,
    zone: "Third Man",
  },
];

const contextDefaults: MatchContext = {
  battingHand: "Right Handed",
  battingStyle: "Aggressive",
  bowlerType: "Fast",
  pitch: "Green",
  format: "T20",
  phase: "Powerplay",
};

const heatmapModes = [
  "Scoring Zones",
  "Boundary Risk",
  "Catch Probability",
  "Field Coverage",
  "Safe Singles",
  "Two-Run Opportunities",
];

const tutorialSteps = [
  {
    target: "context",
    title: "Set The Match Situation",
    body: "Choose batting hand, style, bowler type, pitch, format, and phase first. The assistant reads this context before scoring your field.",
    action: "Use T20 Powerplay",
  },
  {
    target: "presets",
    title: "Load A Professional Shape",
    body: "Presets give you elite starting structures for fast bowling, spin traps, powerplays, middle overs, and death overs.",
    action: "Apply Death Setup",
  },
  {
    target: "board",
    title: "Move Fielders Manually",
    body: "Drag a fielder anywhere on the ground. The label updates instantly, while zoom, pan, rotation, lock, reset, and fullscreen stay manual.",
    action: "Lock Board",
  },
  {
    target: "coach",
    title: "Ask The AI Coach",
    body: "Run analysis to generate balance, attack, defense, boundary protection, catching chances, gaps, and recommended tactical changes.",
    action: "Analyze Field",
  },
  {
    target: "shots",
    title: "Simulate Shot Outcomes",
    body: "Trigger a shot path to inspect trajectory, bounce points, catching risk, and likely boundary zones against the current field.",
    action: "Run Cover Drive",
  },
  {
    target: "heatmap",
    title: "Switch Live Heatmaps",
    body: "Toggle scoring zones, boundary risk, catch probability, coverage, safe singles, and two-run opportunities as the field changes.",
    action: "Show Boundary Risk",
  },
  {
    target: "save",
    title: "Save, Compare, Export",
    body: "Save a setup, compare it with the current field, export PNG or PDF, copy a share URL, import JSON, or download a tactical report.",
    action: "Save Setup",
  },
  {
    target: "coachMode",
    title: "Open Coach Mode Manually",
    body: "Coach Mode is now manual. Open it only when you want notes, voice markers, reports, imports, version checkpoints, and opposition plans.",
    action: "Open Coach Mode",
  },
] as const;

type TutorialTarget = (typeof tutorialSteps)[number]["target"];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const average = (values: number[]) =>
  Math.round(values.reduce((total, value) => total + value, 0) / values.length);

const detectPosition = (
  point: Point,
  battingHand: MatchContext["battingHand"],
) => {
  const mirror = battingHand === "Left Handed" ? -1 : 1;
  const x = point.x * mirror;
  const y = point.y;
  const radius = Math.hypot(x, y);
  const angle = (Math.atan2(y, x) * 180) / Math.PI;

  // Wicket Keeper detection behind striker stumps (y > 29)
  if (Math.abs(x) < 8 && y > 29 && y < 65) return "Wicket Keeper";

  // Bowler detection near bowler stumps (y < -25)
  if (Math.abs(x) < 6 && y > -35 && y < -25) return "Bowler";

  if (radius < 12 && x < -4 && y > 5) return "Leg Slip";
  if (radius < 12 && x > 4 && y > 5) return "Silly Point";
  if (radius < 14 && x > 5 && y < 0) return "Silly Mid Off";
  if (radius < 14 && x < -5 && y < 0) return "Silly Mid On";
  if (radius < 18 && x < -4 && y > 0) return "Short Leg";
  if (radius < 20 && x > -3 && x < 4 && y > 0) return "Wicket Keeper"; // fallback
  if (radius < 28 && x < -7 && y > 7) {
    if (x > -13) return "First Slip";
    if (x > -18) return "Second Slip";
    if (x > -24) return "Third Slip";
    return "Slip";
  }
  if (radius < 35 && x > 10 && y > 7) return "Gully";
  if (radius < 50 && x > 20 && y > 12) return "Fly Slip";
  if (x > 0 && angle > 8 && angle <= 32)
    return radius > 62 ? "Deep Point" : angle > 20 ? "Backward Point" : "Point";
  if (x > 0 && angle > -30 && angle <= 8)
    return radius > 62 ? "Deep Extra Cover" : "Cover";
  if (x > 0 && angle > -62 && angle <= -30)
    return radius > 62 ? "Deep Extra Cover" : "Extra Cover";
  if (x > -8 && x < 18 && y < -12) return radius > 62 ? "Long Off" : "Mid Off";
  if (x < 8 && x > -18 && y < -12) return radius > 62 ? "Long On" : "Mid On";
  if (x < 0 && angle < -115)
    return radius > 62 ? "Deep Midwicket" : "Midwicket";
  if (x < 0 && angle >= -180 && angle < -145)
    return radius > 62 ? "Deep Square Leg" : "Square Leg";
  if (x < 0 && angle > 120) return radius > 62 ? "Deep Fine Leg" : "Fine Leg";
  if (x > 0 && angle > 45) return radius > 62 ? "Deep Third Man" : "Third Man";
  return radius > 66 ? "Boundary Sweeper" : "Ring Fielder";
};

const getCoverageAt = (
  fielders: Fielder[],
  target: Point,
  skill: keyof Pick<Player, "catching" | "speed" | "throwing">,
) => {
  const nearest = Math.min(
    ...fielders.map((fielder) => distance(fielder, target)),
  );
  const rating = average(fielders.map((fielder) => fielder[skill]));
  return clamp(Math.round(100 - nearest * 0.85 + (rating - 80) * 0.55), 8, 98);
};

const analyzeField = (fielders: Fielder[], context: MatchContext): Analysis => {
  const offSide = fielders.filter((fielder) => fielder.x > 8).length;
  const legSide = fielders.filter((fielder) => fielder.x < -8).length;
  const closeCatchers = fielders.filter(
    (fielder) => Math.hypot(fielder.x, fielder.y) < 32,
  ).length;
  const boundaryRiders = fielders.filter(
    (fielder) => Math.hypot(fielder.x, fielder.y) > 62,
  ).length;
  const ringFielders = fielders.length - closeCatchers - boundaryRiders;
  const catchingRating = average(fielders.map((fielder) => fielder.catching));
  const speedRating = average(fielders.map((fielder) => fielder.speed));
  const throwingRating = average(fielders.map((fielder) => fielder.throwing));
  const phaseAggression =
    context.phase === "Powerplay"
      ? 12
      : context.phase === "Death Overs"
        ? -8
        : context.format === "Test"
          ? 8
          : 0;
  const attackScore = clamp(
    closeCatchers * 12 +
      ringFielders * 4 +
      phaseAggression +
      (catchingRating - 70),
    18,
    98,
  );
  const defenseScore = clamp(
    boundaryRiders * 13 +
      speedRating -
      38 +
      (context.phase === "Death Overs" ? 15 : 0),
    20,
    98,
  );
  const boundaryScore = clamp(
    boundaryRiders * 15 +
      getCoverageAt(fielders, { x: 0, y: -88 }, "speed") / 4,
    12,
    98,
  );
  const catchScore = clamp(closeCatchers * 14 + catchingRating - 30, 14, 98);
  const runSaving = clamp(ringFielders * 10 + throwingRating - 42, 20, 98);
  const balance = clamp(
    100 - Math.abs(offSide - legSide) * 9 + (ringFielders - 3) * 3,
    18,
    96,
  );
  const offStrength = clamp(
    offSide * 13 + getCoverageAt(fielders, { x: 75, y: -20 }, "speed") / 3,
    18,
    98,
  );
  const legStrength = clamp(
    legSide * 13 + getCoverageAt(fielders, { x: -75, y: -20 }, "speed") / 3,
    18,
    98,
  );
  const weakZones = [
    offSide < 4 ? "Cover-point corridor" : "",
    legSide < 4 ? "Square-leg release lane" : "",
    boundaryRiders < 4 && context.phase === "Death Overs"
      ? "Straight boundary arc"
      : "",
    closeCatchers < 3 && ["Fast", "Swing", "Seam"].includes(context.bowlerType)
      ? "Slip cordon pressure"
      : "",
  ].filter(Boolean);
  const gaps = shots
    .filter(
      (shot) =>
        getCoverageAt(fielders, shot.path[shot.path.length - 1], "speed") < 56,
    )
    .slice(0, 4)
    .map((shot) => shot.zone);
  const hasKeeper = fielders.some(
    (fielder) =>
      detectPosition(fielder, context.battingHand) === "Wicket Keeper",
  );
  const hasBowler = fielders.some(
    (fielder) => detectPosition(fielder, context.battingHand) === "Bowler",
  );

  const misplaced = [
    ...(!hasKeeper
      ? ["Wicket Keeper is out of position (must be behind striker stumps)"]
      : []),
    ...(!hasBowler
      ? ["Bowler is out of position (must be at bowler's end stumps)"]
      : []),
    ...fielders
      .filter((fielder) => {
        const detected = detectPosition(fielder, context.battingHand);
        if (detected === "Wicket Keeper" || detected === "Bowler") return false;
        return !fielder.preferred.some(
          (position) =>
            detected.includes(position) || position.includes(detected),
        );
      })
      .slice(0, 3)
      .map((fielder) => `${fielder.name} away from ${fielder.preferred[0]}`),
  ];

  return {
    scores: {
      "Field Balance": balance,
      Attack: attackScore,
      Defense: defenseScore,
      "Boundary Protection": boundaryScore,
      "Catching Opportunity": catchScore,
      "Run Saving": runSaving,
      "Off-Side Strength": offStrength,
      "Leg-Side Strength": legStrength,
    },
    weakZones: weakZones.length
      ? weakZones
      : ["No critical structural weakness"],
    gaps: gaps.length ? gaps : ["No obvious scoring gap"],
    misplaced: misplaced.length ? misplaced : ["Personnel alignment is strong"],
    risks: [
      boundaryScore < 58
        ? "Boundary riders are too narrow for death-over bowling"
        : "Boundary shell is stable",
      Math.abs(offStrength - legStrength) > 28
        ? "Field is leaning heavily to one side"
        : "Side-to-side split is controlled",
      catchScore < 55
        ? "Low wicket-taking pressure around the bat"
        : "Catching pressure is credible",
    ],
    recommendations: [
      attackScore < 55
        ? "Pull one sweeper into catching cover for the next two balls"
        : "Keep current wicket-taking pressure",
      context.pitch === "Green"
        ? "Retain gully and third slip until movement fades"
        : "Use a ring fielder to choke singles",
      context.phase === "Death Overs"
        ? "Protect long off, long on, deep square and third man"
        : "Keep one fielder saving one on the off side",
    ],
  };
};

const storageKey = "cricket-field-strategy-simulator";
const legacyPlayerNames = new Set([
  "R. Sharma",
  "V. Kohli",
  "S. Gill",
  "S. Yadav",
  "H. Pandya",
  "R. Jadeja",
  "J. Bumrah",
  "M. Siraj",
  "K. Rahul",
  "A. Patel",
  "Y. Jaiswal",
]);

const normalizeFielders = (loadedFielders: Fielder[]) =>
  loadedFielders.map((fielder, index) => {
    const rest = { ...fielder } as Fielder & { number?: number };
    delete rest.number;
    return {
      ...initialFielders[index],
      ...rest,
      name: legacyPlayerNames.has(fielder.name)
        ? `Player ${index + 1}`
        : fielder.name || `Player ${index + 1}`,
    };
  });

const getInitialFielders = (): Fielder[] => {
  const params = new URLSearchParams(window.location.search);
  const urlFormation = params.get("formation");
  if (urlFormation) {
    try {
      const decoded = JSON.parse(atob(urlFormation)) as {
        fielders?: Fielder[];
      };
      if (decoded.fielders?.length === 11) {
        return normalizeFielders(decoded.fielders);
      }
    } catch (e) {
      console.error("Failed to parse formation from URL", e);
    }
  }
  const saved = localStorage.getItem(storageKey);
  if (!saved) return initialFielders;
  try {
    const parsed = JSON.parse(saved) as { fielders?: Fielder[] };
    return parsed.fielders?.length === 11
      ? normalizeFielders(parsed.fielders)
      : initialFielders;
  } catch {
    return initialFielders;
  }
};

const getInitialContext = (): MatchContext => {
  const params = new URLSearchParams(window.location.search);
  const urlFormation = params.get("formation");
  if (urlFormation) {
    try {
      const decoded = JSON.parse(atob(urlFormation)) as {
        context?: MatchContext;
      };
      if (decoded.context) {
        return { ...contextDefaults, ...decoded.context };
      }
    } catch {}
  }
  const saved = localStorage.getItem(storageKey);
  if (!saved) return contextDefaults;
  try {
    const parsed = JSON.parse(saved) as { context?: MatchContext };
    return parsed.context
      ? { ...contextDefaults, ...parsed.context }
      : contextDefaults;
  } catch {
    return contextDefaults;
  }
};

function App() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fielders, setFielders] = useState<Fielder[]>(getInitialFielders);
  const [stableFielders, setStableFielders] =
    useState<Fielder[]>(getInitialFielders);
  const [context, setContext] = useState<MatchContext>(getInitialContext);
  const [labelMode, setLabelMode] = useState<"name" | "position" | "both">(
    "both",
  );
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [locked, setLocked] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [heatmap, setHeatmap] = useState("Scoring Zones");
  const [activeShot, setActiveShot] = useState<Shot | null>(shots[0]);
  const [shotRun, setShotRun] = useState(0);
  const [analysisRun, setAnalysisRun] = useState(1);
  const [savedFormation, setSavedFormation] = useState<Fielder[] | null>(null);
  const [notes, setNotes] = useState(
    "Plan A: squeeze cover-point, keep long off finer, and force the power hitter square.",
  );
  const [voiceNotes, setVoiceNotes] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<string[]>([
    "New match board created",
    "Powerplay aggressive base loaded",
  ]);
  const [history, setHistory] = useState<Fielder[][]>([initialFielders]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [coachOpen, setCoachOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const analysis = useMemo(
    () => analyzeField(stableFielders, context),
    [stableFielders, context],
  );
  const radarData = useMemo(
    () =>
      Object.entries(analysis.scores).map(([metric, value]) => ({
        metric,
        value,
      })),
    [analysis],
  );
  const barData = useMemo(
    () => [
      { metric: "Boundary", value: analysis.scores["Boundary Protection"] },
      { metric: "Catch", value: analysis.scores["Catching Opportunity"] },
      { metric: "Singles", value: analysis.scores["Run Saving"] },
      { metric: "Off", value: analysis.scores["Off-Side Strength"] },
      { metric: "Leg", value: analysis.scores["Leg-Side Strength"] },
      { metric: "Aggro", value: analysis.scores.Attack },
    ],
    [analysis],
  );
  const comparison = useMemo(() => {
    const saved = savedFormation ? analyzeField(savedFormation, context) : null;
    return [
      [
        "Coverage Difference",
        saved
          ? analysis.scores["Field Balance"] - saved.scores["Field Balance"]
          : 0,
      ],
      [
        "Catch Difference",
        saved
          ? analysis.scores["Catching Opportunity"] -
            saved.scores["Catching Opportunity"]
          : 0,
      ],
      [
        "Weakness Comparison",
        saved ? saved.weakZones.length - analysis.weakZones.length : 0,
      ],
      [
        "Boundary Risk Comparison",
        saved
          ? analysis.scores["Boundary Protection"] -
            saved.scores["Boundary Protection"]
          : 0,
      ],
    ];
  }, [analysis, context, savedFormation]);
  const activeTutorialStep = tutorialSteps[tutorialStep];
  const focusClass = (target: TutorialTarget) =>
    tutorialOpen && activeTutorialStep.target === target
      ? " tutorial-focus"
      : "";

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ fielders, context, notes, savedFormation }),
    );
  }, [context, fielders, notes, savedFormation]);

  const commitFielders = useCallback(
    (next: Fielder[], message?: string) => {
      setFielders(next);
      setStableFielders(next);
      setHistory((current) => {
        const trimmed = current.slice(0, historyIndex + 1);
        return [...trimmed, next].slice(-30);
      });
      setHistoryIndex((current) => Math.min(current + 1, 29));
      if (message) setTimeline((items) => [message, ...items].slice(0, 8));
    },
    [historyIndex],
  );

  const undo = useCallback(() => {
    const nextIndex = Math.max(0, historyIndex - 1);
    setHistoryIndex(nextIndex);
    const next = history[nextIndex];
    setFielders(next);
    setStableFielders(next);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    const nextIndex = Math.min(history.length - 1, historyIndex + 1);
    setHistoryIndex(nextIndex);
    const next = history[nextIndex];
    setFielders(next);
    setStableFielders(next);
  }, [history, historyIndex]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      boardRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
      if (event.key.toLowerCase() === "f") toggleFullscreen();
      if (event.key === "Escape") setLocked(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, toggleFullscreen, undo]);

  const boardPointFromEvent = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const rawX = ((event.clientX - rect.left) / rect.width) * 240 - 120;
    const rawY = ((event.clientY - rect.top) / rect.height) * 240 - 120;
    const adjustedX = (rawX - pan.x) / zoom;
    const adjustedY = (rawY - pan.y) / zoom;
    const radians = (-rotation * Math.PI) / 180;
    return {
      x: clamp(
        adjustedX * Math.cos(radians) - adjustedY * Math.sin(radians),
        -96,
        96,
      ),
      y: clamp(
        adjustedX * Math.sin(radians) + adjustedY * Math.cos(radians),
        -96,
        96,
      ),
    };
  };

  const updateFielderPosition = (id: number, point: Point) => {
    setFielders((current) =>
      current.map((fielder) =>
        fielder.id === id ? { ...fielder, x: point.x, y: point.y } : fielder,
      ),
    );
  };

  const updatePlayerName = (id: number, name: string) => {
    const next = fielders.map((fielder) =>
      fielder.id === id ? { ...fielder, name } : fielder,
    );
    setFielders(next);
    setStableFielders(next);
    setHistory((current) =>
      current.map((snapshot, index) =>
        index === historyIndex
          ? snapshot.map((fielder) =>
              fielder.id === id ? { ...fielder, name } : fielder,
            )
          : snapshot,
      ),
    );
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (activeId && !locked) {
      updateFielderPosition(activeId, boardPointFromEvent(event));
      return;
    }
    if (panStart && dragStart) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 240 - 120;
      const y = ((event.clientY - rect.top) / rect.height) * 240 - 120;
      setPan({
        x: clamp(panStart.x + x - dragStart.x, -42, 42),
        y: clamp(panStart.y + y - dragStart.y, -42, 42),
      });
    }
  };

  const handlePointerUp = () => {
    if (activeId) {
      setFielders((current) => {
        setStableFielders(current);
        const currentSnapshot = current.map((f) => ({ ...f }));
        setHistory((items) =>
          [...items.slice(0, historyIndex + 1), currentSnapshot].slice(-30),
        );
        setHistoryIndex((index) => Math.min(index + 1, 29));
        return current;
      });
    }
    setActiveId(null);
    setPanStart(null);
    setDragStart(null);
  };

  const applyPreset = (name: string) => {
    const points = presets[name];
    commitFielders(
      fielders.map((fielder, index) => ({ ...fielder, ...points[index] })),
      `${name} applied`,
    );
  };

  const resetBoard = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    commitFielders(
      fielders.map((fielder, index) => ({
        ...fielder,
        x: initialFielders[index].x,
        y: initialFielders[index].y,
      })),
      "Board reset to default shape",
    );
  };

  const exportPng = async () => {
    if (!boardRef.current) return;
    const suggestedName = `${context.format.toLowerCase()}-${context.phase.toLowerCase().replace(/\s+/g, "-")}-fielding`;
    const filename = window.prompt(
      "Name this fielding setting:",
      suggestedName,
    );
    if (!filename) return;
    const safeName =
      filename.trim().replace(/[\/\\:?<>|\*"'`]/g, "-") || "fielding-setting";
    const canvas = await html2canvas(boardRef.current, {
      backgroundColor: null,
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = `${safeName}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPdf = async () => {
    if (!boardRef.current) return;
    const canvas = await html2canvas(boardRef.current, {
      backgroundColor: "#071014",
      scale: 2,
    });
    const pdf = new jsPDF("landscape", "mm", "a4");
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 8, 8, 281, 194);
    pdf.save("cricket-tactical-report.pdf");
  };

  const shareUrl = async () => {
    const encoded = btoa(JSON.stringify({ fielders, context }));
    const url = `${window.location.origin}${window.location.pathname}?formation=${encoded}`;
    await navigator.clipboard?.writeText(url);
    setTimeline((items) => ["Share URL copied", ...items].slice(0, 8));
  };

  const importFormation = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as {
          fielders: Fielder[];
        };
        if (parsed.fielders?.length === 11) {
          const next = normalizeFielders(parsed.fielders);
          commitFielders(next, "Imported formation loaded");
        }
      } catch {
        setTimeline((items) =>
          ["Import failed: invalid formation file", ...items].slice(0, 8),
        );
      }
    };
    reader.readAsText(file);
  };

  const downloadReport = () => {
    const report = {
      context,
      scores: analysis.scores,
      weakZones: analysis.weakZones,
      gaps: analysis.gaps,
      recommendations: analysis.recommendations,
      fielders: fielders.map((fielder) => ({
        name: fielder.name,
        position: detectPosition(fielder, context.battingHand),
        x: Math.round(fielder.x),
        y: Math.round(fielder.y),
      })),
      notes,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "cricket-tactical-report.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const recordVoiceNote = () => {
    const note = `Voice note ${voiceNotes.length + 1}: ${new Date().toLocaleTimeString()} tactical marker`;
    setVoiceNotes((items) => [note, ...items]);
    setTimeline((items) => ["Voice note captured", ...items].slice(0, 8));
  };

  const runTutorialAction = () => {
    switch (activeTutorialStep.action) {
      case "Use T20 Powerplay":
        setContext((current) => ({
          ...current,
          format: "T20",
          phase: "Powerplay",
          battingStyle: "Aggressive",
        }));
        break;
      case "Apply Death Setup":
        applyPreset("Death Overs Protection");
        break;
      case "Lock Board":
        setLocked(true);
        break;
      case "Analyze Field":
        setAnalysisRun((value) => value + 1);
        break;
      case "Run Cover Drive":
        setActiveShot(shots[0]);
        setShotRun((value) => value + 1);
        break;
      case "Show Boundary Risk":
        setHeatmap("Boundary Risk");
        break;
      case "Save Setup":
        setSavedFormation(fielders.map((fielder) => ({ ...fielder })));
        setTimeline((items) =>
          ["Tutorial saved a comparison setup", ...items].slice(0, 8),
        );
        break;
      case "Open Coach Mode":
        setCoachOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <main className={theme === "dark" ? "app-shell dark" : "app-shell light"}>
      <AnimatedBackdrop />
      <motion.header
        className="topbar"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        <div className="brand-lockup">
          <div className="brand-mark">
            <Radar size={22} />
          </div>
          <div>
            <p className="eyebrow">Elite Strategy Room</p>
            <h1>Cricket Field Strategy Simulator</h1>
          </div>
        </div>
        <div className="top-actions">
          <button
            className={
              tutorialOpen ? "tutorial-button active" : "tutorial-button"
            }
            onClick={() => {
              setTutorialOpen(true);
              setTutorialStep(0);
            }}
          >
            <HelpCircle size={18} />
            Tutorial
          </button>
          <IconButton label="Undo" onClick={undo} disabled={historyIndex === 0}>
            <Undo2 size={18} />
          </IconButton>
          <IconButton
            label="Redo"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo2 size={18} />
          </IconButton>
          <IconButton
            label={locked ? "Unlock positions" : "Lock positions"}
            onClick={() => setLocked((value) => !value)}
          >
            {locked ? <Lock size={18} /> : <Unlock size={18} />}
          </IconButton>
          <IconButton
            label="Toggle theme"
            onClick={() =>
              setTheme((value) => (value === "dark" ? "light" : "dark"))
            }
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
          <button
            className="primary-button"
            onClick={() => setAnalysisRun((value) => value + 1)}
          >
            <Bot size={18} />
            Analyze Field
          </button>
        </div>
      </motion.header>

      <div className="workspace">
        <aside className="left-rail">
          <Panel
            title="Match Context"
            icon={<Activity size={18} />}
            className={focusClass("context")}
          >
            <SelectGroup
              label="Batting Hand"
              value={context.battingHand}
              options={["Right Handed", "Left Handed"]}
              onChange={(battingHand) =>
                setContext((current) => ({ ...current, battingHand }))
              }
            />
            <SelectGroup
              label="Batting Style"
              value={context.battingStyle}
              options={["Aggressive", "Anchor", "Power Hitter", "Finisher"]}
              onChange={(battingStyle) =>
                setContext((current) => ({ ...current, battingStyle }))
              }
            />
            <SelectGroup
              label="Bowler Type"
              value={context.bowlerType}
              options={[
                "Fast",
                "Swing",
                "Seam",
                "Off Spinner",
                "Leg Spinner",
                "Left Arm Orthodox",
                "Mystery Spinner",
              ]}
              onChange={(bowlerType) => {
                setContext((current) => ({ ...current, bowlerType }));
                const isSpin = [
                  "Off Spinner",
                  "Leg Spinner",
                  "Left Arm Orthodox",
                  "Mystery Spinner",
                ].includes(bowlerType);
                setFielders((currentFielders) => {
                  const nextFielders = currentFielders.map((fielder) => {
                    if (
                      fielder.role === "Keeper" &&
                      fielder.x === 0 &&
                      (fielder.y === 48 || fielder.y === 35 || fielder.y === 42)
                    ) {
                      return { ...fielder, y: isSpin ? 35 : 48 };
                    }
                    return fielder;
                  });
                  setStableFielders(nextFielders);
                  return nextFielders;
                });
              }}
            />
            <SelectGroup
              label="Pitch"
              value={context.pitch}
              options={["Flat", "Green", "Dusty", "Turning", "Wet"]}
              onChange={(pitch) =>
                setContext((current) => ({ ...current, pitch }))
              }
            />
            <div className="two-col">
              <SelectGroup
                label="Format"
                value={context.format}
                options={["T10", "T20", "ODI", "Test"]}
                onChange={(format) =>
                  setContext((current) => ({ ...current, format }))
                }
              />
              <SelectGroup
                label="Phase"
                value={context.phase}
                options={["Powerplay", "Middle Overs", "Death Overs"]}
                onChange={(phase) =>
                  setContext((current) => ({ ...current, phase }))
                }
              />
            </div>
          </Panel>

          <Panel
            title="Formation Presets"
            icon={<Layers3 size={18} />}
            className={focusClass("presets")}
          >
            <div className="preset-section">
              <p>Fast Bowling Attack</p>
              {["Test Match Attack", "Swing Attack", "New Ball Setup"].map(
                (preset) => (
                  <PresetButton
                    key={preset}
                    label={preset}
                    onClick={() => applyPreset(preset)}
                  />
                ),
              )}
            </div>
            <div className="preset-section">
              <p>Spin Bowling Attack</p>
              {["Off Spin Trap", "Leg Spin Trap"].map((preset) => (
                <PresetButton
                  key={preset}
                  label={preset}
                  onClick={() => applyPreset(preset)}
                />
              ))}
            </div>
            <div className="preset-section">
              <p>Limited Overs</p>
              {[
                "Powerplay Aggressive",
                "Powerplay Defensive",
                "Middle Overs Choke",
                "Death Overs Protection",
              ].map((preset) => (
                <PresetButton
                  key={preset}
                  label={preset}
                  onClick={() => applyPreset(preset)}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Players" icon={<Users size={18} />}>
            <div className="player-list">
              {fielders.map((fielder) => (
                <motion.div
                  className="player-card"
                  key={fielder.id}
                  whileHover={{ y: -3, scale: 1.01 }}
                >
                  <div
                    className="player-swatch"
                    style={{
                      borderColor: fielder.color,
                      background: `${fielder.color}22`,
                    }}
                  />
                  <div className="player-meta">
                    <input
                      aria-label={`Name for player ${fielder.id}`}
                      value={fielder.name}
                      onChange={(event) =>
                        updatePlayerName(fielder.id, event.target.value)
                      }
                      onFocus={(event) => event.target.select()}
                      onPointerDown={(event) => event.stopPropagation()}
                    />
                    <span>
                      {fielder.role} /{" "}
                      {detectPosition(fielder, context.battingHand)}
                    </span>
                    <div className="rating-bars">
                      <i
                        style={{
                          width: `${fielder.skill}%`,
                          background: fielder.color,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Panel>
        </aside>

        <section className={`field-stage${focusClass("board")}`}>
          <div className="stage-toolbar">
            <div className={`toolbar-group${focusClass("save")}`}>
              <IconButton
                label="Zoom in"
                onClick={() =>
                  setZoom((value) => clamp(value + 0.12, 0.68, 1.75))
                }
              >
                <ZoomIn size={18} />
              </IconButton>
              <IconButton
                label="Zoom out"
                onClick={() =>
                  setZoom((value) => clamp(value - 0.12, 0.68, 1.75))
                }
              >
                <ZoomOut size={18} />
              </IconButton>
              <IconButton label="Reset positions" onClick={resetBoard}>
                <RotateCcw size={18} />
              </IconButton>
              <IconButton
                label="Fullscreen tactical board"
                onClick={toggleFullscreen}
              >
                <Maximize2 size={18} />
              </IconButton>
            </div>
            <div className="rotation-control">
              <Compass size={17} />
              <input
                aria-label="Rotate field"
                max={180}
                min={-180}
                type="range"
                value={rotation}
                onChange={(event) => setRotation(Number(event.target.value))}
              />
              <span>{rotation} deg</span>
            </div>
            <div className="label-selector-group">
              <span className="label-selector-title">Labels</span>
              <div className="label-toggle-buttons">
                {(["position", "name", "both"] as const).map((mode) => (
                  <button
                    key={mode}
                    className={labelMode === mode ? "active" : ""}
                    onClick={() => setLabelMode(mode)}
                  >
                    {mode === "position"
                      ? "Pos"
                      : mode === "name"
                        ? "Name"
                        : "Both"}
                  </button>
                ))}
              </div>
            </div>
            <div className="toolbar-group">
              <IconButton
                label="Save formation"
                onClick={() =>
                  setSavedFormation(fielders.map((fielder) => ({ ...fielder })))
                }
              >
                <Save size={18} />
              </IconButton>
              <IconButton label="Export PNG" onClick={exportPng}>
                <Download size={18} />
              </IconButton>
              <IconButton label="Export PDF" onClick={exportPdf}>
                <FileDown size={18} />
              </IconButton>
              <IconButton label="Share URL" onClick={shareUrl}>
                <Share2 size={18} />
              </IconButton>
            </div>
          </div>

          <motion.div
            className="tactical-board"
            ref={boardRef}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 16 }}
          >
            <div className="stadium-rim" />
            <svg
              className="field-svg"
              viewBox="-120 -120 240 240"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setDragStart({
                    x: ((event.clientX - rect.left) / rect.width) * 240 - 120,
                    y: ((event.clientY - rect.top) / rect.height) * 240 - 120,
                  });
                  setPanStart(pan);
                }
              }}
              onWheel={(event) => {
                event.preventDefault();
                setZoom((value) =>
                  clamp(value + (event.deltaY > 0 ? -0.08 : 0.08), 0.68, 1.75),
                );
              }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="grass" cx="50%" cy="50%" r="58%">
                  <stop offset="0%" stopColor="#3ecf78" stopOpacity="0.58" />
                  <stop offset="52%" stopColor="#127046" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#052218" stopOpacity="1" />
                </radialGradient>
                <linearGradient id="pitch" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#d9b46f" />
                  <stop offset="100%" stopColor="#8c6535" />
                </linearGradient>
              </defs>
              <g
                transform={`translate(${pan.x} ${pan.y}) scale(${zoom}) rotate(${rotation})`}
              >
                <circle cx="0" cy="0" r="111" fill="#0b1220" opacity="0.68" />
                <circle
                  cx="0"
                  cy="0"
                  r="101"
                  fill="url(#grass)"
                  stroke="#b7ffcc"
                  strokeDasharray="3 6"
                  strokeWidth="1.2"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="94"
                  fill="none"
                  stroke="#e7ff9d"
                  strokeOpacity="0.55"
                  strokeWidth="1.3"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="48"
                  fill="none"
                  stroke="#ddffef"
                  strokeDasharray="2 3"
                  strokeOpacity="0.65"
                  strokeWidth="1"
                />
                <g opacity="0.2">
                  {Array.from({ length: 18 }).map((_, index) => (
                    <line
                      key={index}
                      x1="0"
                      y1="-101"
                      x2="0"
                      y2="101"
                      stroke="#dcfce7"
                      strokeWidth="0.4"
                      transform={`rotate(${index * 10})`}
                    />
                  ))}
                </g>
                <rect
                  x="-7.5"
                  y="-38"
                  width="15"
                  height="76"
                  rx="2"
                  fill="url(#pitch)"
                  stroke="#ffefc7"
                  strokeWidth="0.8"
                />
                <line
                  x1="-16"
                  y1="-28"
                  x2="16"
                  y2="-28"
                  stroke="#fff7dd"
                  strokeWidth="0.9"
                />
                <line
                  x1="-16"
                  y1="28"
                  x2="16"
                  y2="28"
                  stroke="#fff7dd"
                  strokeWidth="0.9"
                />
                <line
                  x1="-11"
                  y1="-34"
                  x2="-11"
                  y2="-20"
                  stroke="#fff7dd"
                  strokeWidth="0.65"
                />
                <line
                  x1="11"
                  y1="-34"
                  x2="11"
                  y2="-20"
                  stroke="#fff7dd"
                  strokeWidth="0.65"
                />
                <line
                  x1="-11"
                  y1="20"
                  x2="-11"
                  y2="34"
                  stroke="#fff7dd"
                  strokeWidth="0.65"
                />
                <line
                  x1="11"
                  y1="20"
                  x2="11"
                  y2="34"
                  stroke="#fff7dd"
                  strokeWidth="0.65"
                />
                <Wickets y={-31} />
                <Wickets y={31} />
                <text x="0" y="-108" textAnchor="middle" className="svg-label">
                  NORTH
                </text>
                <text x="108" y="3" textAnchor="middle" className="svg-label">
                  OFF
                </text>
                <text x="-108" y="3" textAnchor="middle" className="svg-label">
                  LEG
                </text>
                <Heatmap mode={heatmap} fielders={stableFielders} />
                <AnimatePresence>
                  {activeShot &&
                    (() => {
                      const isSpin = [
                        "Off Spinner",
                        "Leg Spinner",
                        "Left Arm Orthodox",
                        "Mystery Spinner",
                      ].includes(context.bowlerType);
                      const bowlTime = isSpin ? 0.75 : 0.45;
                      const shotTime = 1.25;
                      const totalTime = bowlTime + shotTime;
                      const xKeyframes = [
                        0,
                        0,
                        activeShot.path[1].x,
                        activeShot.path[2].x,
                      ];
                      const yKeyframes = [
                        -31,
                        28,
                        activeShot.path[1].y + 28,
                        activeShot.path[2].y + 28,
                      ];
                      const times = [
                        0,
                        bowlTime / totalTime,
                        (bowlTime + 0.5) / totalTime,
                        1,
                      ];
                      const rKeyframes = [
                        2.5,
                        2.8,
                        activeShot.name.includes("Lofted") ||
                        activeShot.name.includes("Hook") ||
                        activeShot.name.includes("Upper")
                          ? 6
                          : 3.5,
                        2.2,
                      ];

                      return (
                        <motion.g
                          key={`${activeShot.name}-${shotRun}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {/* Shot Trace Line (starts drawing from contact crease) */}
                          <motion.path
                            d={`M 0 28 L ${activeShot.path[1].x} ${activeShot.path[1].y + 28} L ${activeShot.path[2].x} ${activeShot.path[2].y + 28}`}
                            fill="none"
                            stroke="#fef08a"
                            strokeLinecap="round"
                            strokeWidth="2.2"
                            filter="url(#glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{
                              delay: bowlTime,
                              duration: shotTime,
                              ease: "easeOut",
                            }}
                          />

                          {/* Bat Contact Pulse Effect */}
                          <motion.circle
                            cx={0}
                            cy={28}
                            r={12}
                            fill="none"
                            stroke="#fde68a"
                            strokeWidth="1.5"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 1.4], opacity: [0, 0.9, 0] }}
                            transition={{
                              delay: bowlTime,
                              duration: 0.35,
                              ease: "easeOut",
                            }}
                          />

                          {/* Moving Cricket Ball */}
                          <motion.circle
                            r="3"
                            fill="#fb7185"
                            stroke="#ffffff"
                            strokeWidth="0.5"
                            filter="url(#glow)"
                            animate={{
                              cx: xKeyframes,
                              cy: yKeyframes,
                              r: rKeyframes,
                            }}
                            transition={{
                              duration: totalTime,
                              times: times,
                              ease: "easeOut",
                            }}
                          />
                        </motion.g>
                      );
                    })()}
                </AnimatePresence>
                {fielders.map((fielder) => {
                  const position = detectPosition(fielder, context.battingHand);
                  const labelText =
                    labelMode === "position"
                      ? position
                      : labelMode === "name"
                        ? fielder.name
                        : `${fielder.name} (${position})`;
                  const labelWidth = Math.max(32, labelText.length * 2.1 + 6);
                  return (
                    <motion.g
                      className={locked ? "fielder locked" : "fielder"}
                      key={fielder.id}
                      animate={{ x: fielder.x, y: fielder.y }}
                      transition={
                        activeId === fielder.id
                          ? { type: "tween", duration: 0 }
                          : {
                              type: "spring",
                              stiffness: 220,
                              damping: 24,
                              mass: 0.75,
                            }
                      }
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        if (!locked) setActiveId(fielder.id);
                      }}
                    >
                      <circle
                        r="7.8"
                        fill="#071014"
                        stroke={fielder.color}
                        strokeWidth="2.2"
                        filter="url(#glow)"
                      />
                      <circle r="4.4" fill={fielder.color} opacity="0.9" />
                      <g transform="translate(10 -10)">
                        <rect
                          x="0"
                          y="0"
                          width={labelWidth}
                          height="10"
                          rx="3"
                          fill="#061117"
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth="0.5"
                          opacity="0.88"
                        />
                        <text x="4" y="6.8" className="position-label">
                          {labelText}
                        </text>
                      </g>
                    </motion.g>
                  );
                })}
              </g>
            </svg>
            <div className="board-hud">
              <MetricPill label="Zoom" value={`${Math.round(zoom * 100)}%`} />
              <MetricPill label="Rotation" value={`${rotation} deg`} />
              <MetricPill
                label="Mode"
                value={locked ? "Locked" : "Live Drag"}
              />
            </div>
          </motion.div>

          <div className="simulation-row">
            <Panel
              title="Shot Simulation"
              icon={<Play size={18} />}
              className={focusClass("shots")}
            >
              <div className="shot-grid">
                {shots.map((shot) => (
                  <button
                    className={
                      activeShot?.name === shot.name
                        ? "shot-chip active"
                        : "shot-chip"
                    }
                    key={shot.name}
                    onClick={() => {
                      setActiveShot(shot);
                      setShotRun((value) => value + 1);
                    }}
                  >
                    <span>{shot.name}</span>
                    <i>{shot.risk}% risk</i>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel
              title="Heatmap Analytics"
              icon={<Target size={18} />}
              className={focusClass("heatmap")}
            >
              <div className="heatmap-tabs">
                {heatmapModes.map((mode) => (
                  <button
                    className={mode === heatmap ? "active" : ""}
                    key={mode}
                    onClick={() => setHeatmap(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </Panel>
          </div>
        </section>

        <aside className="right-rail">
          <Panel
            title="AI Coach"
            icon={<Bot size={18} />}
            className={focusClass("coach")}
          >
            <motion.div
              key={analysisRun}
              className="score-orbit"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div>
                <strong>{analysis.scores["Field Balance"]}</strong>
                <span>Field Balance</span>
              </div>
            </motion.div>
            <InsightList title="Weak Zones" items={analysis.weakZones} />
            <InsightList title="Gaps" items={analysis.gaps} />
            <InsightList
              title="Misplaced Fielders"
              items={analysis.misplaced}
            />
            <InsightList title="High-Risk Areas" items={analysis.risks} />
            <InsightList
              title="Recommended Changes"
              items={analysis.recommendations}
            />
          </Panel>

          <Panel title="Analytics Dashboard" icon={<BarChart3 size={18} />}>
            <div className="chart-box">
              <ResponsiveContainer height={210} width="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.16)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: "rgba(226,232,240,0.7)", fontSize: 9 }}
                  />
                  <RadarShape
                    dataKey="value"
                    stroke="#22d3ee"
                    fill="#22d3ee"
                    fillOpacity={0.34}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#061117",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-box">
              <ResponsiveContainer height={170} width="100%">
                <BarChart data={barData}>
                  <XAxis
                    dataKey="metric"
                    stroke="rgba(226,232,240,0.55)"
                    fontSize={10}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "#061117",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="value" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Formation Comparison" icon={<ShieldCheck size={18} />}>
            <div className="comparison-list">
              {comparison.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong
                    className={Number(value) >= 0 ? "positive" : "negative"}
                  >
                    {savedFormation
                      ? `${Number(value) > 0 ? "+" : ""}${value}`
                      : "Save setup"}
                  </strong>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Connect" icon={<Users size={18} />}>
            <div className="contact-links">
              <a
                className="contact-link"
                href="https://www.linkedin.com/in/sagarakanoone/"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Linkedin size={18} />
                <span>LinkedIn</span>
              </a>
              <a
                className="contact-link"
                href="https://github.com/Sagar264offici/"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Github size={18} />
                <span>GitHub</span>
              </a>
              <a
                className="contact-link"
                href="https://instagram.com/multiverse.sagar"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Instagram size={18} />
                <span>Instagram</span>
              </a>
              <a
                className="contact-link"
                href="mailto:nooneisusingthismail@gmail.com"
              >
                <span>Contact Developer</span>
              </a>
            </div>
          </Panel>
        </aside>
      </div>

      <motion.section
        className={`${coachOpen ? "coach-drawer open" : "coach-drawer"}${focusClass("coachMode")}`}
        layout
      >
        <button
          className="coach-toggle"
          onClick={() => setCoachOpen((value) => !value)}
        >
          <ClipboardList size={18} />
          Coach Mode
          <ChevronRight size={17} />
        </button>
        <AnimatePresence initial={false}>
          {coachOpen && (
            <motion.div
              className="coach-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
              <div className="coach-actions">
                <button onClick={recordVoiceNote}>
                  <Mic size={17} />
                  Voice Note
                </button>
                <button onClick={downloadReport}>
                  <FileDown size={17} />
                  Tactical Report
                </button>
                <button onClick={() => fileInputRef.current?.click()}>
                  <Import size={17} />
                  Import
                </button>
                <button
                  onClick={() =>
                    setTimeline((items) =>
                      ["Version checkpoint saved", ...items].slice(0, 8),
                    )
                  }
                >
                  <History size={17} />
                  Version
                </button>
              </div>
              <div className="timeline-grid">
                <div>
                  <h3>Match Timeline</h3>
                  {timeline.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
                <div>
                  <h3>Voice Notes</h3>
                  {(voiceNotes.length
                    ? voiceNotes
                    : ["No voice notes captured"]
                  ).map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
                <div>
                  <h3>Opposition Analysis</h3>
                  <p>
                    {context.battingStyle} batter against{" "}
                    {context.bowlerType.toLowerCase()} on a{" "}
                    {context.pitch.toLowerCase()} pitch.
                  </p>
                  <p>Primary trap: {analysis.recommendations[0]}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept="application/json"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) importFormation(file);
        }}
      />
      <AnimatePresence>
        {tutorialOpen && (
          <motion.div
            className="tutorial-agent"
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
          >
            <div className="tutorial-agent-header">
              <div>
                <span>Strategy Assistant</span>
                <strong>
                  Step {tutorialStep + 1} of {tutorialSteps.length}
                </strong>
              </div>
              <IconButton
                label="Close tutorial"
                onClick={() => setTutorialOpen(false)}
              >
                <X size={17} />
              </IconButton>
            </div>
            <div className="tutorial-progress">
              <i
                style={{
                  width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%`,
                }}
              />
            </div>
            <h2>{activeTutorialStep.title}</h2>
            <p>{activeTutorialStep.body}</p>
            <div className="tutorial-actions">
              <button onClick={runTutorialAction}>
                <Sparkles size={16} />
                {activeTutorialStep.action}
              </button>
              <button
                disabled={tutorialStep === 0}
                onClick={() => setTutorialStep((step) => Math.max(0, step - 1))}
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (tutorialStep === tutorialSteps.length - 1) {
                    setTutorialOpen(false);
                    return;
                  }
                  setTutorialStep((step) => step + 1);
                }}
              >
                {tutorialStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function AnimatedBackdrop() {
  return (
    <div className="animated-backdrop" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 40 }}
          animate={{
            opacity: [0, 0.75, 0],
            y: [-20, -130],
            x: [0, index % 2 ? 26 : -22],
          }}
          transition={{
            duration: 5 + (index % 6),
            repeat: Infinity,
            delay: index * 0.28,
          }}
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${28 + ((index * 19) % 68)}%`,
          }}
        />
      ))}
    </div>
  );
}

function Wickets({ y }: { y: number }) {
  return (
    <g transform={`translate(0 ${y})`}>
      {[-2.4, 0, 2.4].map((x) => (
        <line
          key={x}
          x1={x}
          y1="-4"
          x2={x}
          y2="4"
          stroke="#f8fafc"
          strokeLinecap="round"
          strokeWidth="0.85"
        />
      ))}
    </g>
  );
}

function Heatmap({ mode, fielders }: { mode: string; fielders: Fielder[] }) {
  const zones = [
    {
      x: 74,
      y: -48,
      value:
        mode === "Boundary Risk"
          ? 76
          : getCoverageAt(fielders, { x: 74, y: -48 }, "speed"),
      color: "#ef4444",
    },
    {
      x: -70,
      y: -38,
      value:
        mode === "Scoring Zones"
          ? 82
          : getCoverageAt(fielders, { x: -70, y: -38 }, "speed"),
      color: "#f97316",
    },
    {
      x: 58,
      y: 42,
      value:
        mode === "Catch Probability"
          ? getCoverageAt(fielders, { x: 22, y: 12 }, "catching")
          : 52,
      color: "#22d3ee",
    },
    {
      x: -28,
      y: 66,
      value:
        mode === "Safe Singles"
          ? 80
          : getCoverageAt(fielders, { x: -28, y: 66 }, "throwing"),
      color: "#a3e635",
    },
    {
      x: 0,
      y: -82,
      value:
        mode === "Two-Run Opportunities"
          ? 74
          : getCoverageAt(fielders, { x: 0, y: -82 }, "speed"),
      color: "#e879f9",
    },
    {
      x: 28,
      y: -18,
      value:
        mode === "Field Coverage"
          ? 90
          : getCoverageAt(fielders, { x: 28, y: -18 }, "speed"),
      color: "#14b8a6",
    },
  ];
  return (
    <motion.g
      key={mode}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {zones.map((zone) => (
        <motion.circle
          key={`${zone.x}-${zone.y}-${mode}`}
          cx={zone.x}
          cy={zone.y}
          r={18 + zone.value / 7}
          fill={zone.color}
          opacity={0.07 + zone.value / 850}
          initial={{ scale: 0.6 }}
          animate={{ scale: [0.82, 1.04, 0.96] }}
          transition={{ duration: 2.6, repeat: Infinity, repeatType: "mirror" }}
        />
      ))}
    </motion.g>
  );
}

function Panel({
  title,
  icon,
  children,
  className = "",
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.section
      className={`glass-panel ${className}`}
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ borderColor: "rgba(94, 234, 212, 0.34)" }}
    >
      <div
        className="panel-title"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isOpen ? "12px" : "0px",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {icon}
          <h2>{title}</h2>
        </div>
        <span
          style={{
            fontSize: "10px",
            opacity: 0.6,
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      className="icon-button"
      disabled={disabled}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SelectGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="select-group">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function PresetButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      className="preset-button"
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Wand2 size={15} />
      {label}
    </motion.button>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="insight-list">
      <h3>
        <Sparkles size={14} />
        {title}
      </h3>
      {items.map((item) => (
        <p key={item}>
          <Focus size={13} />
          {item}
        </p>
      ))}
    </div>
  );
}

export default App;
