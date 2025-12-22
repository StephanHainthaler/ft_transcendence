
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/auth" | "/error" | "/friends" | "/game" | "/health" | "/profile" | "/tournament";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/auth": Record<string, never>;
			"/error": Record<string, never>;
			"/friends": Record<string, never>;
			"/game": Record<string, never>;
			"/health": Record<string, never>;
			"/profile": Record<string, never>;
			"/tournament": Record<string, never>
		};
		Pathname(): "/" | "/auth" | "/auth/" | "/error" | "/error/" | "/friends" | "/friends/" | "/game" | "/game/" | "/health" | "/health/" | "/profile" | "/profile/" | "/tournament" | "/tournament/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}