import type { Route } from '@lib/types/route';
import { mount, update } from '@lib/vdom';

type Location = { pathname: string, file: string };

export const routes: Location[] = [
  {
    pathname: "/",
    file: "HomePage",
  },
  {
    pathname: "/user",
    file: "UserPage",
  },
  {
    pathname: "/health",
    file: "HealthPage"
  },
  {
    pathname: "/auth",
    file: "AuthPage",
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

  async init(): Promise<Router> {
    const route = await this.loadPage(this.curLocation);

    mount(route(), this.app);
    return this;
  }

  async refresh() {
    this.goto(this.curLocation);
  }

  async loadPage(location: string): Promise<Route> {
    const matchedRoute = routes.find(r => r.pathname === location);

    if (!matchedRoute)
      throw new Error(`Location ${location} doesnt exits`);

    const fetchedRoute = await import(`./pages/${matchedRoute.file}.ts`);

    this.routes.set(matchedRoute.pathname, fetchedRoute.Page);
    return fetchedRoute.Page;
  }

  async goto(location: string, isPopState?: boolean) {
    try {
      console.info(`Navigating to: ${location}`);

      const route = await this.loadPage(location);

      if (!route) {
        throw new Error(`Failed to load location ${location}`)
      };

      route();

      if (!isPopState && location !== this.curLocation)
        history.pushState({}, '', location);

      this.curLocation = location;
    } catch (e: any) {
      console.error(`Routing Error: ${e.message || e}`);
    }
  }

  get location(): string {
    return this.curLocation;
  }
}

export const router = await new Router(window.location.pathname).init();
