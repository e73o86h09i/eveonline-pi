# EVE Online PI Calculator

A web application for calculating and visualizing Planetary Interaction (PI) production chains in [EVE Online](https://www.eveonline.com/), with live market prices and profit margins.

## Features

- **Multi-commodity selector** — browse and select one or more P1–P4 commodities, grouped by tier, with inline buy/sell prices and margin %
- **Trade station selector** — switch between major trade hubs (Jita, Amarr, Dodixie, Rens, Hek) to update all prices
- **Production chain tree** — view the full recursive production chain as a collapsible tree, from the selected commodity down to raw resources, with market prices and margins on every node
- **Production summary table** — a flat tabular view of all materials grouped by tier, with columns for quantity, buy/sell prices, margin/run, and production time
- **Draggable InfoCards** — click any commodity name to open a floating detail card showing total quantity & runs, market prices, margin breakdown, recipe per run, total inputs, consumers, and planet harvesting info for raw resources
- **Market prices** — live buy/sell prices from the Fuzzwork Market API displayed across the entire UI
- **Profit margins** — per-run margin calculated from schematics: `outputPerRun × buyMax − Σ(inputQtyPerRun × sellMin)`, shown as ISK and %
- **Accurate calculations** — accounts for schematic output quantities and run batching (e.g. P1 produces 20 per run, P2 produces 5 per run)
- **Tier badges** — color-coded tier labels (R0, P1, P2, P3, P4) on every node
- **Commodity icons** — 32×32 icons from the EVE Image Server on all nodes, rows, and cards
- **Cycle time** — each node shows total production time for the required runs
- **Exact numbers toggle** — switch between compact (120k, 1.5M) and exact (120,000) number formatting
- **Foldable tree** — expand/collapse any level; collapsing a node resets all nested levels
- **Sorted by tier** — inputs are sorted from highest tier to lowest within each node
- **Planet harvesting info** — InfoCards for raw resources (R0) show which planet types they can be extracted from

## Tech Stack

- [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) v4 + [Flowbite React](https://flowbite-react.com/) for UI components
- [EVE Ref API](https://docs.everef.net/datasets/reference-data.html) for commodity and schematic data
- [Fuzzwork Market API](https://market.fuzzwork.co.uk/) for live market prices
- [EVE Image Server](https://images.evetech.net/) for commodity icons

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
