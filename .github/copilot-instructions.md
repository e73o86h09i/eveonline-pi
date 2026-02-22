# This is the React + TypeScript + Vite application that uses flowbite-react and tailwindcss for styling.

## About
This project is an EVE Online Planetary Interaction (PI) Calculator. It provides a web UI for selecting any P1–P4 planetary commodity and viewing its full recursive production chain — from the finished product down to raw planetary resources.

Key features:
- **Commodity selector** grouped by tier (P1 Basic, P2 Refined, P3 Specialized, P4 Advanced)
- **Collapsible production chain tree** showing every intermediate and raw input with accurate quantities
- **Schematic-aware calculations** that account for output-per-run batching (e.g. P1 produces 20 per run, P2 produces 5)
- **Tier-colored badges** (R0 gray, P1 red, P2 yellow, P3 green, P4 blue) and **sorted inputs** (highest tier first)
- **Hover tooltips** with per-run schematic formula, cycle time per run, and total quantities/duration
- **Cycle time display** on each tree node showing the total production time for the required runs
- **Exact numbers toggle** to switch between compact (120k) and full (120,000) formatting
- **Foldable tree** where collapsing a node resets all nested levels

## APIs
The application uses the [EVE Ref public API](https://docs.everef.net/datasets/reference-data.html) to get commodity and schematic data.

### Endpoints
- **Type details**: [`/types/{typeID}`](https://ref-data.everef.net/types/2869) — returns commodity info including `name`, `group_id`, and `produced_by_schematic_ids` (array of schematic IDs that produce this type)
- **Schematic details**: [`/schematics/{schematicID}`](https://ref-data.everef.net/schematics/114) — returns `materials` (inputs) and `products` (outputs) with quantities per run, plus `cycle_time`
- **Group members**: [`/groups/{groupID}`](https://ref-data.everef.net/groups/1042) — returns all type IDs belonging to a group

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
Define React components using `FC` from React with `export default`:

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

export default MyComponent;
```

If a component is simple and contains only the render part (no logic, hooks, or intermediate variables), use the short return syntax:

```tsx
const MyComponent: FC<MyComponentProps> = ({ foo, bar }) => (
  <div>{foo}</div>
);

export default MyComponent;
```

Components without props use `FC` with no generic argument:

```tsx
const Header: FC = () => (
  <nav>...</nav>
);

export default Header;
```

Components that are **not** in their own directory (i.e. a single `.tsx` file without a dedicated folder) use a named export directly:

```tsx
export { Header };
```

Barrel `index.ts` files re-export default exports as named exports:

```ts
export { default as MyComponent } from './MyComponent';
```

This way, all components are imported uniformly using named imports:

```ts
import { Header } from './components/Header';
import { ProductionChain } from './components/ProductionChain';
```
