import type { Route } from '@lib/types/route';
import { mount, update } from '@lib/vdom';
import { Layout } from '@lib/components/layout';
import { ErrorPage } from './pages/ErrorPage';
import { Loader } from '@lib/components/ui/Loader';

type Location = { pathname: string, file: string };

export const routes: Location[] = [
  {
    pathname: "/",
    file: "HomePage",
  },
  {
    pathname: "/user",
    file: "ProfilePage",
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
    console.log('current location ', curLocation)
    const app = document.querySelector("#app");
    if (!app) throw new Error("FATAL: Failed to find app element");
    this.app = app as HTMLDivElement;
    this.routes = new Map();
    this.curLocation = curLocation || '/';
  }

  async init(): Promise<Router> {
    console.log('router init location: ', this.curLocation)
    console.log(this.app);
    try {
      const route = await this.loadPage(this.curLocation);
      mount(await Layout(await route()), this.app);
    } catch (e: any) {
      console.error(`Failed to load route ${this.curLocation}`);
      mount(await Layout(ErrorPage('404')), this.app);
    }

    return this;
  }

  async refresh() {
    this.goto(this.curLocation);
  }

  async loadPage(location: string): Promise<Route> {
    const matchedRoute = routes.find(r => r.pathname === location);
    if (!matchedRoute)
      throw new Error(`Location ${location} doesnt exits`);

    console.log(matchedRoute)
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

        update(Loader())
        setTimeout(async () => {
          update(await Layout(await route()));
        }, 400);

        if (!isPopState && location !== this.curLocation)
          history.pushState({}, '', location);

        this.curLocation = location;
      } catch (e: any) {
        console.error(`Routing Error: ${e.message || e}`);
        if (e.page) {
          update(await Layout(await e.page()))
        } else {
          update(await Layout(ErrorPage('404')));
        }
      }
  }

  get location(): string {
    return this.curLocation;
  }
}

export const router = await new Router(window.location.pathname).init();

export const goto = async (path: string) => {
  await router.goto(path);
}
export const refresh = async () => {
  await router.refresh();
}
