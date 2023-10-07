

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.b9b5a066.js","_app/immutable/chunks/scheduler.89b69e6b.js","_app/immutable/chunks/index.7d6b9076.js"];
export const stylesheets = [];
export const fonts = [];
