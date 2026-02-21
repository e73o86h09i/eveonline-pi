# EVE Online PI Calculator

A web application for calculating and visualizing Planetary Interaction (PI) production chains in the game [EVE Online](https://www.eveonline.com/).

## Features

- **Commodity selector** — browse and select any P1–P4 planetary commodity, grouped by tier
- **Production chain tree** — view the full recursive production chain as a collapsible tree, from the selected commodity down to raw resources
- **Accurate calculations** — accounts for schematic output quantities and run batching (e.g. P1 produces 20 per run, P2 produces 5 per run)
- **Tier badges** — color-coded tier labels (R0, P1, P2, P3, P4) on every node
- **Tooltips** — hover any node to see the per-run schematic formula, cycle time, and total quantities
- **Cycle time** — each node shows total production time; tooltips show per-run and total duration
- **Exact numbers toggle** — switch between compact (120k, 1.5M) and exact (120,000) number formatting
- **Foldable tree** — expand/collapse any level; collapsing a node resets all nested levels
- **Sorted by tier** — inputs are sorted from highest tier to lowest within each node

## Tech Stack

- [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) v4 + [Flowbite React](https://flowbite-react.com/) for UI components
- [EVE Ref API](https://docs.everef.net/datasets/reference-data.html) for commodity and schematic data

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

- `npm run dev` — start development server with HMR
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview production build locally
