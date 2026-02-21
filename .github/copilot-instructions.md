# This is the React + TypeScript + Vite application that uses flowbite-react and tailwindcss for styling.

## About
This projects aims to make it easier to calculate and setup Planetary Interaction (PI) in the game EVE Online.
It provides a user-friendly interface that allows to see the overall necessary resources and commodities to produce the selected commodity.

Planetary Interaction may be splitted into two steps: extraction and processing.
The first step is to extract the raw materials from the planets.
The second step is to process the raw materials into intermediate products of four possible tiers: p1, p2, p3, and p4.

Application allows to select the desired commodity and see the necessary resources and commodities to produce it in a clear and organized way.

## APIs
The application uses the [EVE Ref public API](https://docs.everef.net/datasets/reference-data.html) to get the necessary data about the commodities and their schematics.

To get the data about commodities, use the [/types/{typeID}](https://ref-data.everef.net/types/2869) endpoint, where typeID is the ID of the commodity.
To get the data about schematics, use the [/schematics/{schematicID}](https://ref-data.everef.net/schematics/114) endpoint.

The commodities group IDs can be found in the [Planetary Commodities Category (ID: 43)](https://ref-data.everef.net/categories/43)
```json
{
  "category_id": 43,
  "name": {
    "de": "Planetarische Güter",
    "en": "Planetary Commodities",
    "fr": "Marchandises planétaires",
    "ja": "惑星商品",
    "ru": "Планетарные товары",
    "es": "Mercancías planetarias",
    "ko": "행성 생산품",
    "zh": "行星商品"
  },
  "published": true,
  "group_ids": [1034, 1040, 1041, 1042]
}
```

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
