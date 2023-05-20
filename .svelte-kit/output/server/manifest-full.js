export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["about.txt","android-chrome-192x192.png","android-chrome-512x512.png","apple-touch-icon.png","crate.png","favicon-16x16.png","favicon-32x32.png","favicon.ico","site.webmanifest","temp_player.png"]),
	mimeTypes: {".txt":"text/plain",".png":"image/png",".ico":"image/vnd.microsoft.icon",".webmanifest":"application/manifest+json"},
	_: {
		client: {"start":{"file":"_app/immutable/entry/start.29991f71.js","imports":["_app/immutable/entry/start.29991f71.js","_app/immutable/chunks/index.3806aa4f.js","_app/immutable/chunks/singletons.403ff71d.js","_app/immutable/chunks/utils.d2eec17c.js"],"stylesheets":[],"fonts":[]},"app":{"file":"_app/immutable/entry/app.5249439d.js","imports":["_app/immutable/entry/app.5249439d.js","_app/immutable/chunks/index.3806aa4f.js"],"stylesheets":[],"fonts":[]}},
		nodes: [
			() => import('./nodes/0.js'),
			() => import('./nodes/1.js'),
			() => import('./nodes/2.js'),
			() => import('./nodes/3.js')
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			},
			{
				id: "/server/dedicated",
				pattern: /^\/server\/dedicated\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 3 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
