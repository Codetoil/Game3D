

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.b99741a1.js","_app/immutable/chunks/scheduler.89b69e6b.js","_app/immutable/chunks/index.7d6b9076.js","_app/immutable/chunks/singletons.def6577e.js"];
export const stylesheets = [];
export const fonts = [];
