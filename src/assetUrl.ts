/**
 * URL of a file in `public/`, relative to where the site is served. Locally
 * that is the domain root; on GitHub Pages it is the repository's folder
 * (set at build time with `vite build --base`, see .github/workflows/deploy.yml).
 */
export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;
