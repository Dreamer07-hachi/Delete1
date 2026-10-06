# Polish & Shine

Audit the entire app without redesigning it. Fix the following: (1) any dead buttons or broken links, so every sidebar item, sub-nav tab, and table action works or shows a clear "Placeholder" toast; (2) role-based access, by testing each demo role and ensuring only permitted modules/actions are visible and unauthorized routes show Access Denied; (3) loading, empty, no-results, and error states on every list page; (4) responsiveness at 375px, 768px, and 1280px (sidebar drawer, scrollable tables, stacked KPI cards, single-column forms); (5) TypeScript errors and console warnings; (6) confirm that no UI component imports mockData directly, and that every module accesses data only through its service. Then add a README.md at the project root documenting the folder structure, the service pattern, how to switch a module from mock to REST (config/api.ts), and the endpoint list per module.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/58246ba7-8c72-4bb1-a7c5-10453b0350c9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
