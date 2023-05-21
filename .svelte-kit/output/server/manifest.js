export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["about.txt","android-chrome-192x192.png","android-chrome-512x512.png","apple-touch-icon.png","crate.png","favicon-16x16.png","favicon-32x32.png","favicon.ico","site.webmanifest","temp_player.png"]),
	mimeTypes: {".txt":"text/plain",".png":"image/png",".ico":"image/vnd.microsoft.icon",".webmanifest":"application/manifest+json"},
	_: {
		client: {"start":"_app/immutable/entry/start.84a5c08f.js","app":"_app/immutable/entry/app.e3e05d40.js","imports":["_app/immutable/entry/start.84a5c08f.js","_app/immutable/chunks/index.4c60c239.js","_app/immutable/chunks/singletons.51b65ea5.js","_app/immutable/entry/app.e3e05d40.js","_app/immutable/chunks/index.4c60c239.js"],"stylesheets":[],"fonts":[]},
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
};
