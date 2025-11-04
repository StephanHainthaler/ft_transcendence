import type { Route } from '@lib/types/route';

export const routes = [
  {
    pathname: "/",
    file: "HomePage",
  },
  { 
    pathname: "/user",
    file: "UserPage",
  }
];

export class Router {
  private app: HTMLDivElement;
  private curLocation: string;
  private routes: Map<string, Route>;
  constructor(curLocation?: string) {
    const app = document.querySelector("#app");
    if (!app) throw new Error("FATAL: Failed to find app  element");
    this.app = app as HTMLDivElement;
    this.routes = new Map();
    this.curLocation = curLocation || '/';
  }

  async refresh() {
    this.goto(this.curLocation);
  }

  async goto(location: string, isPopState?: boolean) {
    try {
      console.info(`Navigating to: ${location}`);
      const matchedRoute = routes.find(r => r.pathname === location);

      if (matchedRoute) {
        const currentRoute = this.routes.get(this.curLocation);
        if (currentRoute) {
          currentRoute.destroy()
        }
        if (!this.routes.has(matchedRoute.pathname)) {
          const fetchedRoute = await import(`./pages/${matchedRoute.file}.ts`);
          this.routes.set(matchedRoute.pathname, fetchedRoute.Page);
        }

        const route = this.routes.get(location);
        if (!route) {
          throw new Error(`Failed to load location ${location}`)
        };

        this.app.innerHTML = route.page();
        route.setup();

        this.curLocation = matchedRoute.pathname;

        if (!isPopState)
          history.pushState({}, '', location);

      } else {
        throw new Error("Route not found!");
      }
    } catch (e: any) {
      console.error(`Routing Error: ${e.message || e}`);
    }
  }

  get location(): string {
    return this.curLocation;
  }
}

export const router = new Router(window.location.pathname);
