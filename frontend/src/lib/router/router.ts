import type { Route } from '@lib/types/route';
import { mount, update } from '@lib/vdom';
import { Layout } from '@lib/components/layout';
import { ErrorPage } from '../../routes/pages/ErrorPage';
import { Loader } from '@lib/components/ui/Loader';
import { client } from '@lib/api/client';
import { ErrorNotLoggedIn } from '@lib/components/error';

type Location = { pathname: string, file: string, protected: boolean };

export const routes: Location[] = [
  {
    pathname: "/",
    file: "HomePage",
    protected: false,
  },
  {
    pathname: "/user",
    file: "ProfilePage",
    protected: true,
  },
  {
    pathname: "/game",
    file: "GamePage",
    protected: true,
  },
  {
    pathname: "/health",
    file: "HealthPage",
    protected: true,
  },
  {
    pathname: "/friend",
    file: "FriendPage",
    protected: true,
  },
  {
    pathname: "/tournament",
    file: "TournamentPage",
    protected: true,
  },
  {
    pathname: "/auth",
    file: "AuthPage",
    protected: false,
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
      let matchedRoute = routes.find(r => r.pathname === this.curLocation);
      if (!matchedRoute) matchedRoute = routes.find(r => r.pathname === '/')!;

      const route = await this.loadPage(matchedRoute);
      mount(Layout(route()), this.app);
    } catch (e: any) {
      console.error(`Failed to load route ${this.curLocation}`);
      mount(Layout(ErrorPage('404')), this.app);
    }

    return this;
  }

  async refresh() {
    this.goto(this.curLocation);
  }

  async loadPage(matchedRoute: Location): Promise<Route> {

    console.log(matchedRoute)
    const fetchedRoute = await import(`../../routes/pages/${matchedRoute.file}.ts`);

    this.routes.set(matchedRoute.pathname, fetchedRoute.Page);
    return fetchedRoute.Page;
  }

  async goto(location: string, isPopState?: boolean) {
    try {
      console.info(`Navigating to: ${location}`);
      update(Loader())

      const matchedRoute = routes.find(r => r.pathname === location);
      if (!matchedRoute) {
        throw new Error(`Location ${location} doesnt exits`);
      } else if (matchedRoute.protected && !client.isLoggedIn) {
        return update(ErrorNotLoggedIn());
      }

      const route = await this.loadPage(matchedRoute);

      if (!route) {
        throw new Error(`Failed to load location ${location}`)
      };

      if (!isPopState && location !== this.curLocation)
        history.pushState({}, '', location);

      setTimeout(() => {
        update(Layout(route()));
      }, 400);

      this.curLocation = location;
    } catch (e: any) {
      console.error(`Routing Error: ${e.message || e}`);
      if (e.page) {
        update(Layout(e.page()))
      } else {
        update(Layout(ErrorPage('404')));
      }
    }
  }

  get location(): string {
    return this.curLocation;
  }
}

export let router = new Router(window.location.pathname);

export const goto = async (path: string) => {
  await router.goto(path);
}
export const refresh = async () => {
  await router.refresh();
}
