# This is the React + TypeScript + Vite application that uses flowbite-react and tailwindcss for styling.

## About
This project is an EVE Online Planetary Interaction (PI) Calculator. It provides a web UI for selecting one or more P1–P4 planetary commodities and viewing their full recursive production chains — from the finished product down to raw planetary resources — alongside live market prices and profit margins.

Key features:
- **Multi-commodity selector** grouped by tier (P1 Basic, P2 Refined, P3 Specialized, P4 Advanced), with inline buy/sell prices and margin %
- **Trade station selector** to switch between major trade hubs (Jita, Amarr, Dodixie, Rens, Hek)
- **Collapsible production chain tree** showing every intermediate and raw input with accurate quantities, market prices, and per-run profit margins
- **Production summary table** — a flat tabular view of all materials grouped by tier, with columns for quantity, buy/sell prices, margin/run, and production time
- **Draggable InfoCards** opened by clicking any commodity name, showing detailed info: total quantity & runs, market buy/sell prices, margin per run (ISK + % with cost breakdown), recipe per run, total inputs, "Used by" consumers, and planet types for raw resources (R0)
- **Market prices** fetched from the Fuzzwork Market API, displayed on tree nodes, summary rows, InfoCards, and commodity dropdown items
- **Profit margins** calculated from schematic data: `outputPerRun × buyMax − Σ(inputQtyPerRun × sellMin)`, shown as absolute ISK and percentage
- **Schematic-aware calculations** that account for output-per-run batching (e.g. P1 produces 20 per run, P2 produces 5)
- **Tier-colored badges** (R0 gray, P1 red, P2 yellow, P3 green, P4 blue) and **sorted inputs** (highest tier first)
- **Commodity icons** from the EVE Image Server on all nodes, rows, and cards
- **Cycle time display** on each tree node showing the total production time for the required runs
- **Exact numbers toggle** to switch between compact (120k) and full (120,000) formatting
- **Foldable tree** where collapsing a node resets all nested levels
- **Planet harvesting info** for raw resources (R0) showing which planet types they can be extracted from

## APIs
The application uses three external APIs:

### EVE Ref API
The [EVE Ref public API](https://docs.everef.net/datasets/reference-data.html) provides commodity and schematic data. All responses are client-side cached.

- **Type details**: [`/types/{typeID}`](https://ref-data.everef.net/types/2869) — returns commodity info including `name`, `group_id`, `produced_by_schematic_ids`, `harvested_by_pin_type_ids`, and `dogma_attributes`
- **Schematic details**: [`/schematics/{schematicID}`](https://ref-data.everef.net/schematics/114) — returns `materials` (inputs) and `products` (outputs) with quantities per run, plus `cycle_time`
- **Group members**: [`/groups/{groupID}`](https://ref-data.everef.net/groups/1042) — returns all type IDs belonging to a group

### Fuzzwork Market API
The [Fuzzwork Market API](https://market.fuzzwork.co.uk/) provides live market price aggregates.

- **Price aggregates**: `/aggregates/?station={stationId}&types={typeId1},{typeId2},...` — returns per-type buy/sell order stats (`weightedAverage`, `max`, `min`, `stddev`, `median`, `volume`, `orderCount`, `percentile`)

Prices are fetched for all commodities (R0–P4) at the selected trade station. The app uses `buy.max` (highest buy order) and `sell.min` (lowest sell order) for display and margin calculations.

### EVE Image Server
The [EVE Image Server](https://images.evetech.net/) provides commodity icons.

- **Type icon**: `/types/{typeId}/icon?size=32` — 32×32 PNG icon

### Group IDs
Planetary Commodities belong to [Category 43](https://ref-data.everef.net/categories/43) with these groups:
| Tier | Group IDs | Output per run |
|------|-----------|----------------|
| R0 (Raw Resources) | 1032, 1033, 1035 | N/A (extracted) |
| P1 (Basic) | 1042 | 20 |
| P2 (Refined) | 1034 | 5 |
| P3 (Specialized) | 1040 | 3 |
| P4 (Advanced) | 1041 | 1 |

> **Note:** Raw resources (R0) belong to [Category 42](https://ref-data.everef.net/categories/42), not Category 43. They are not selectable in the commodity picker but appear as leaf nodes in production chains.

### Schematic structure
Each schematic has `materials` (inputs) and `products` (outputs) keyed by type ID:
```json
{
  "schematic_id": 69,
  "cycle_time": 3600,
  "materials": {
    "2392": { "quantity": 40, "type_id": 2392 },
    "3683": { "quantity": 40, "type_id": 3683 }
  },
  "products": {
    "2317": { "quantity": 5, "type_id": 2317 }
  }
}
```
The product `quantity` is the **output per run** and must be used to calculate the number of runs needed: `runs = ceil(desired / outputPerRun)`.

## Code Style
Prefer `type` over `interface` for defining types, unless you need to use features that are only available in `interface`, such as declaration merging or implementing classes. This is because `type` is more flexible and can be used to define a wider range of types, such as union types, intersection types, and mapped types.

### Arrow Functions
Use arrow-function syntax (`const fn = () => {}`) for **all** functions — components, hooks, helpers, API functions, and utilities. Never use the `function` keyword. This includes:
- Exported functions: `export const myHelper = () => { ... };`
- Module-scoped helpers: `const buildTree = async () => { ... };`
- Inner/nested functions: `const walk = (node: Node) => { ... };`

### Variable Naming
Never use single-character variable names. Use descriptive names that convey the variable's purpose. The only exceptions are:
- `i`, `j`, `k` — commonly used as loop indexes
- `a`, `b` — commonly used in comparator/sort callbacks

Examples of what **not** to do:
- `(n: number)` → use `value`, `quantity`, etc.
- `.map((t) => ...)` → use `tier`, `type`, etc.
- `.map((c) => ...)` → use `consumer`, `commodity`, etc.
- `(e: React.ChangeEvent)` → use `event`
- `(g) => g.type_ids` → use `group`

### Imports
Never have two import statements from the same module. When importing both types and values from the same source, use inline `type` specifiers in a single import:

```ts
// ✅ Good — single import with inline type
import { type FC, useState } from 'react';
import { type Project, TRADE_STATIONS } from '../../types';

// ❌ Bad — duplicate imports from the same module
import type { FC } from 'react';
import { useState } from 'react';
```

If a module provides only types, a standalone `import type` is fine:

```ts
import type { CommodityType } from '../../types';
```

### Blank Lines
Enforced by ESLint via `@stylistic/padding-line-between-statements`:
- **Before `return`** — add a blank line before every `return` statement, unless it is the only statement in the block.
- **After block-like statements** — add a blank line after `if`/`else`, `for`, `while`, `switch`, `try`/`catch`/`finally` blocks before the next statement.

### Utility Functions Organization
Keep helper functions close to where they are used, following low coupling / high cohesion:
- **Component-level utils** — If helpers are only used within a single component folder, put them in a `utils.ts` file inside that folder (e.g. `ProductionChain/utils.ts`).
- **Shared utils** — If helpers are used across multiple component folders or layers (hooks, api, etc.), put them in `src/utils.ts` (or `src/utils/` if there are many).
- **Module-scoped helpers** — If a helper is only used in a single file (not exported), keep it in the same file above the component or hook that uses it.

## Component Organization
Keep every component in a separate file named after the component with `.tsx` extension. For example, `Header.tsx` for the `Header` component.

If one component is used in another, create a folder named after the parent component and put the child component inside it.
For example, if `Header` uses `Logo`, create a folder named `Header` and put `Logo.tsx` inside it.
Also put the `Header.tsx` file inside the `Header` folder.
This way, we can keep the components organized and easy to find.
Use directory index to export public components from the folder. For example, in `Header/index.ts`, export `Header` component, but not `Logo` component, because it is only used in `Header` component. This way, we can keep the public API of the folder clean and easy to use.

An example of the folder structure is as follows:

```
src/
  components/
    Header/
      index.ts
      Header.tsx
      Logo.tsx
    Footer.tsx // Footer does not use any other component, so it is not in a folder
```

Put reusable components that are used in multiple places in a separate folder named `common`. For example, if `Button` is used in both `Header` and `Footer`, put it in `src/components/common/Button.tsx`.

Talking shortly, follow the low copuling high cohesion principle to keep the components organized and easy to maintain.

## Component Syntax
Define React components using `FC` from React. Always use **named exports** — never use `export default`:

```tsx
import type { FC } from 'react';

type MyComponentProps = {
  foo: string;
  bar: boolean;
};

const MyComponent: FC<MyComponentProps> = ({ foo, bar }) => {
  // logic here

  return (
    <div>{foo}</div>
  );
};

export { MyComponent };
```

If a component is simple and contains only the render part (no logic, hooks, or intermediate variables), use the short return syntax:

```tsx
const MyComponent: FC<MyComponentProps> = ({ foo, bar }) => (
  <div>{foo}</div>
);

export { MyComponent };
```

Components without props use `FC` with no generic argument:

```tsx
const Header: FC = () => (
  <nav>...</nav>
);

export { Header };
```

Barrel `index.ts` files re-export named exports:

```ts
export { MyComponent } from './MyComponent';
```

All components are imported uniformly using named imports:

```ts
import { Header } from './components/Header';
import { ProductionChain } from './components/ProductionChain';
```
