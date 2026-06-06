# 🏏 Cricket Field Strategy Simulator

An interactive, high-performance, and visually stunning tactical simulator designed to help cricket captains, coaches, and strategists plan, analyze, and simulate fielding placements. Built with a modern glassmorphic UI, responsive controls, and live tactical feedback.

Live development server: `http://localhost:5174` (when running locally)

---

## ✨ Key Features

### 🎮 Interactive Strategy Board
* **Butter-Smooth Drag & Drop**: Real-time fielder positioning running at a fluid 60fps.
* **Camera Controls**: Pan, zoom, and rotate the entire field in 3D-like perspective.
* **Responsive Labels**: Toggle display modes between player **Positions** (e.g. Wicket Keeper, Slip), **Names** (e.g. V. Kohli), or **Both** dynamically.
* **Auto-Resizing Labels**: Smart SVG label widths automatically adjust based on text length to prevent clipping.

### ⚡ Realistic Shot & Ball Simulation
* **Bowling Phase**: Animates the ball being delivered from the bowler's end stumps `(0, -31)` to the striker's crease `(0, 28)`.
* **Bat Contact Effect**: Triggers a visual impact pulse at the crease at the exact moment of impact.
* **Translated Trajectories**: All shot paths are dynamically offset to originate from the striker's crease rather than the field center.
* **3D Height Scaling**: Shots like the *Lofted Drive*, *Hook*, and *Upper Cut* scale the ball's radius up in mid-flight to represent flight height before landing.

### 🤖 Intelligent AI Coach & Placements
* **Auto-Repositioning Keeper**: Wicket Keeper dynamically shifts forward for spinner types `(y = 35)` and back for fast bowler types `(y = 48)`.
* **Positional Validation**: Flags critical fielding errors (like a missing Wicket Keeper or Bowler) under the AI Coach misplaced panel.
* **Performance Metric Radar**: Real-time evaluation of:
  * Field Balance (Off/Leg side split)
  * Attack & Defense Scores
  * Catching & Run Saving Opportunities
  * Boundary Protection effectiveness

### 📋 Professional Fielding Presets
Includes 9 tactical blueprints for match setups:
* **Fast Bowling**: Test Match Attack, Swing Attack, New Ball Setup.
* **Spin Trap**: Off Spin Trap, Leg Spin Trap.
* **Limited Overs**: Powerplay Aggressive, Powerplay Defensive, Middle Overs Choke, Death Overs Protection.

### 📱 Responsive & Mobile-First
* **Collapsible Control Panels**: Click any sidebar panel header to collapse or expand modules, keeping the workspace clutter-free on phone screens.
* **Adaptable CSS Grid Layout**: Stacks controls cleanly on mobile viewports while highlighting the board.
* **Multi-Touch & Drag Support**: Optimized using Pointer Events for touch screens.

### 💾 Data Portability & Sharing
* **Baseline Comparison**: Save a tactical placement and compare changes dynamically against new arrangements.
* **PDF & PNG Exports**: Download tactics maps or full tactical PDF reports.
* **JSON Reports**: Export structured JSON data of positions, recommendations, and match context.
* **Shareable URL Configuration**: Generate link configs that encode field settings to easily share strategies via a URL.

---

## 🛠️ Technology Stack

* **Core**: React 18, TypeScript, Vite
* **Animations**: Framer Motion
* **Visualizations**: Recharts (Radar & Bar charts)
* **Styling**: Vanilla CSS, TailwindCSS, PostCSS, Lucide React (Icons)
* **Exports**: html2canvas, jsPDF

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed on your machine.

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Sagar264offici/Cricket_Field_Simulation.git
   cd Cricket_Field_Simulation
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the address shown in the terminal (usually `http://localhost:5173` or `http://localhost:5174`).

4. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
├── src/
│   ├── App.tsx          # Central application logic, state, and SVG board rendering
│   ├── main.tsx         # Application entry point
│   ├── styles.css       # Responsive custom CSS layout and glassmorphism styling
│   └── vite-env.d.ts    # Vite environment declarations
├── dist/                # Production build assets
├── eslint.config.js     # Linter configuration
├── tsconfig.json        # TypeScript configuration compiler options
└── vite.config.ts       # Vite project settings
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs, styling improvements, or new fielding presets.
