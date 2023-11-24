import { defineConfig } from 'vite';

function manualChunks(id) {
	return 'server';
}

export default defineConfig({
    publicDir: false,
	build: {
		rollupOptions: {
			input: {
				server: '/server.ts'
			},
			output: {
				manualChunks: manualChunks,
				format: 'es',
				dir: 'dist/server'
			}
		},
	},
	server: {
		// vite server configs, for details see [vite doc](https://vitejs.dev/config/#server-host)
		port: 3000
	},
	plugins: [],
	optimizeDeps: {
		
	},
});