import * as universal from '../entries/pages/_page.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.ts";
export const imports = ["_app/immutable/nodes/2.e60a13ed.js","_app/immutable/chunks/scheduler.89b69e6b.js","_app/immutable/chunks/index.7d6b9076.js"];
export const stylesheets = ["_app/immutable/assets/2.43156e19.css"];
export const fonts = [];
