
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const CSB: string;
	export const npm_package_devDependencies_vitest: string;
	export const PITCHER_CLIENTS_WSS_PORT: string;
	export const npm_config_version_commit_hooks: string;
	export const npm_config_user_agent: string;
	export const SUPERVISOR_GROUP_NAME: string;
	export const NODE_VERSION: string;
	export const npm_config_bin_links: string;
	export const HOSTNAME: string;
	export const YARN_VERSION: string;
	export const npm_node_execpath: string;
	export const npm_package_devDependencies_vite: string;
	export const npm_config_init_version: string;
	export const SHLVL: string;
	export const HOME: string;
	export const OLDPWD: string;
	export const npm_package_devDependencies__typescript_eslint_parser: string;
	export const npm_package_dependencies__babylonjs_loaders: string;
	export const npm_package_devDependencies_eslint_config_prettier: string;
	export const PERMISSION_WATCHER_VERSION: string;
	export const npm_config_init_license: string;
	export const npm_config_cache_folder: string;
	export const DIRENV_DIFF: string;
	export const YARN_WRAP_OUTPUT: string;
	export const npm_package_devDependencies_svelte_check: string;
	export const npm_config_version_tag_prefix: string;
	export const LC_CTYPE: string;
	export const DIRENV_CONFIG: string;
	export const NIX_PROFILES: string;
	export const npm_package_scripts_check: string;
	export const npm_package_description: string;
	export const npm_package_devDependencies_typescript: string;
	export const NVM_DIR: string;
	export const npm_package_readmeFilename: string;
	export const NIX_REMOTE: string;
	export const npm_package_devDependencies_prettier: string;
	export const npm_package_devDependencies__playwright_test: string;
	export const npm_package_scripts_dev: string;
	export const LOGNAME: string;
	export const VERSION: string;
	export const npm_package_type: string;
	export const PROJECT_GID: string;
	export const _: string;
	export const npm_package_scripts_check_watch: string;
	export const npm_package_private: string;
	export const PNPM_VERSION: string;
	export const npm_package_dependencies_xss: string;
	export const npm_package_devDependencies__typescript_eslint_eslint_plugin: string;
	export const npm_package_scripts_lint: string;
	export const npm_config_registry: string;
	export const PITCHER_MANAGER_WSS_PORT: string;
	export const TERM: string;
	export const WORKSPACE_PATH: string;
	export const NPM_CONFIG_STORE_DIR: string;
	export const npm_config_cache: string;
	export const WATCHMAN_VERSION: string;
	export const PITCHER_BIN_PATH: string;
	export const npm_package_devDependencies_eslint_plugin_svelte3: string;
	export const npm_config_ignore_scripts: string;
	export const npm_config_version: string;
	export const PATH: string;
	export const NODE: string;
	export const YARN_CACHE_FOLDER: string;
	export const PITCHER_WORKSPACE_PATH: string;
	export const DIRENV_WATCHES: string;
	export const npm_package_name: string;
	export const npm_config_store_dir: string;
	export const XDG_RUNTIME_DIR: string;
	export const ZSH_DISABLE_COMPFIX: string;
	export const npm_package_scripts_test_unit: string;
	export const npm_package_devDependencies_eslint: string;
	export const SUPERVISOR_ENABLED: string;
	export const npm_lifecycle_script: string;
	export const npm_package_devDependencies__sveltejs_kit: string;
	export const npm_package_scripts_test: string;
	export const npm_config_version_git_message: string;
	export const npm_lifecycle_event: string;
	export const npm_package_dependencies_jquery: string;
	export const npm_package_version: string;
	export const NVM_VERSION: string;
	export const PITCHER_API_BASE_URL: string;
	export const npm_config_argv: string;
	export const npm_package_devDependencies_tslib: string;
	export const npm_package_devDependencies_svelte: string;
	export const npm_package_scripts_build: string;
	export const CSB_BASE_PREVIEW_HOST: string;
	export const PITCHER_ENV: string;
	export const DIRENV_DIR: string;
	export const DOCKER_HOST: string;
	export const NIX_SSL_CERT_FILE: string;
	export const npm_config_version_git_tag: string;
	export const npm_config_version_git_sign: string;
	export const SUPERVISOR_SERVER_URL: string;
	export const npm_config_strict_ssl: string;
	export const SUPERVISOR_PROCESS_NAME: string;
	export const npm_package_scripts_format: string;
	export const NPM_CONFIG_CACHE: string;
	export const PWD: string;
	export const CODESANDBOX_HOST: string;
	export const npm_execpath: string;
	export const NVM_CD_FLAGS: string;
	export const npm_package_dependencies_ts_mixer: string;
	export const npm_package_devDependencies__sveltejs_adapter_auto: string;
	export const npm_config_save_prefix: string;
	export const npm_config_ignore_optional: string;
	export const npm_package_devDependencies_prettier_plugin_svelte: string;
	export const npm_package_scripts_preview: string;
	export const npm_package_dependencies__babylonjs_core: string;
	export const INIT_CWD: string;
	export const DIRENV_LOG_FORMAT: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {

}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		CSB: string;
		npm_package_devDependencies_vitest: string;
		PITCHER_CLIENTS_WSS_PORT: string;
		npm_config_version_commit_hooks: string;
		npm_config_user_agent: string;
		SUPERVISOR_GROUP_NAME: string;
		NODE_VERSION: string;
		npm_config_bin_links: string;
		HOSTNAME: string;
		YARN_VERSION: string;
		npm_node_execpath: string;
		npm_package_devDependencies_vite: string;
		npm_config_init_version: string;
		SHLVL: string;
		HOME: string;
		OLDPWD: string;
		npm_package_devDependencies__typescript_eslint_parser: string;
		npm_package_dependencies__babylonjs_loaders: string;
		npm_package_devDependencies_eslint_config_prettier: string;
		PERMISSION_WATCHER_VERSION: string;
		npm_config_init_license: string;
		npm_config_cache_folder: string;
		DIRENV_DIFF: string;
		YARN_WRAP_OUTPUT: string;
		npm_package_devDependencies_svelte_check: string;
		npm_config_version_tag_prefix: string;
		LC_CTYPE: string;
		DIRENV_CONFIG: string;
		NIX_PROFILES: string;
		npm_package_scripts_check: string;
		npm_package_description: string;
		npm_package_devDependencies_typescript: string;
		NVM_DIR: string;
		npm_package_readmeFilename: string;
		NIX_REMOTE: string;
		npm_package_devDependencies_prettier: string;
		npm_package_devDependencies__playwright_test: string;
		npm_package_scripts_dev: string;
		LOGNAME: string;
		VERSION: string;
		npm_package_type: string;
		PROJECT_GID: string;
		_: string;
		npm_package_scripts_check_watch: string;
		npm_package_private: string;
		PNPM_VERSION: string;
		npm_package_dependencies_xss: string;
		npm_package_devDependencies__typescript_eslint_eslint_plugin: string;
		npm_package_scripts_lint: string;
		npm_config_registry: string;
		PITCHER_MANAGER_WSS_PORT: string;
		TERM: string;
		WORKSPACE_PATH: string;
		NPM_CONFIG_STORE_DIR: string;
		npm_config_cache: string;
		WATCHMAN_VERSION: string;
		PITCHER_BIN_PATH: string;
		npm_package_devDependencies_eslint_plugin_svelte3: string;
		npm_config_ignore_scripts: string;
		npm_config_version: string;
		PATH: string;
		NODE: string;
		YARN_CACHE_FOLDER: string;
		PITCHER_WORKSPACE_PATH: string;
		DIRENV_WATCHES: string;
		npm_package_name: string;
		npm_config_store_dir: string;
		XDG_RUNTIME_DIR: string;
		ZSH_DISABLE_COMPFIX: string;
		npm_package_scripts_test_unit: string;
		npm_package_devDependencies_eslint: string;
		SUPERVISOR_ENABLED: string;
		npm_lifecycle_script: string;
		npm_package_devDependencies__sveltejs_kit: string;
		npm_package_scripts_test: string;
		npm_config_version_git_message: string;
		npm_lifecycle_event: string;
		npm_package_dependencies_jquery: string;
		npm_package_version: string;
		NVM_VERSION: string;
		PITCHER_API_BASE_URL: string;
		npm_config_argv: string;
		npm_package_devDependencies_tslib: string;
		npm_package_devDependencies_svelte: string;
		npm_package_scripts_build: string;
		CSB_BASE_PREVIEW_HOST: string;
		PITCHER_ENV: string;
		DIRENV_DIR: string;
		DOCKER_HOST: string;
		NIX_SSL_CERT_FILE: string;
		npm_config_version_git_tag: string;
		npm_config_version_git_sign: string;
		SUPERVISOR_SERVER_URL: string;
		npm_config_strict_ssl: string;
		SUPERVISOR_PROCESS_NAME: string;
		npm_package_scripts_format: string;
		NPM_CONFIG_CACHE: string;
		PWD: string;
		CODESANDBOX_HOST: string;
		npm_execpath: string;
		NVM_CD_FLAGS: string;
		npm_package_dependencies_ts_mixer: string;
		npm_package_devDependencies__sveltejs_adapter_auto: string;
		npm_config_save_prefix: string;
		npm_config_ignore_optional: string;
		npm_package_devDependencies_prettier_plugin_svelte: string;
		npm_package_scripts_preview: string;
		npm_package_dependencies__babylonjs_core: string;
		INIT_CWD: string;
		DIRENV_LOG_FORMAT: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: string]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
