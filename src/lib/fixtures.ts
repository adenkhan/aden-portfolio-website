/**
 * Dev-only switch for the break-ui worst-case data. Static pages cannot read query strings, so it is
 * a Vite mode: `npm run dev:worst` (astro dev --mode worst). Always false in production builds.
 */
export function isWorstCase(): boolean {
  return import.meta.env.DEV && import.meta.env.MODE === "worst";
}
