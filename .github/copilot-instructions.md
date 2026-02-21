# This is the React + TypeScript + Vite application that uses flowbite-react and tailwindcss for styling.

## Code Style
Prefer `type` over `interface` for defining types, unless you need to use features that are only available in `interface`, such as declaration merging or implementing classes. This is because `type` is more flexible and can be used to define a wider range of types, such as union types, intersection types, and mapped types.

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
