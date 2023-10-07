export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["about.txt","android-chrome-192x192.png","android-chrome-512x512.png","apple-touch-icon.png","crate.png","favicon-16x16.png","favicon-32x32.png","favicon.ico","site.webmanifest","temp_player.png"]),
	mimeTypes: {".txt":"text/plain",".png":"image/png",".ico":"image/vnd.microsoft.icon",".webmanifest":"application/manifest+json"},
	_: {
		client: {"start":"_app/immutable/entry/start.fc92effb.js","app":"_app/immutable/entry/app.8ea443ef.js","imports":["_app/immutable/entry/start.fc92effb.js","_app/immutable/chunks/scheduler.89b69e6b.js","_app/immutable/chunks/singletons.def6577e.js","_app/immutable/entry/app.8ea443ef.js","_app/immutable/chunks/scheduler.89b69e6b.js","_app/immutable/chunks/index.7d6b9076.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/server",
				pattern: /^\/server\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
