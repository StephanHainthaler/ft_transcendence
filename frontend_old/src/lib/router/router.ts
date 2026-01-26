import type { Route } from '@lib/types/route';
import { mount, update } from '@lib/vdom';
import { ErrorPage } from '../../routes/pages/ErrorPage';
import { Loader } from '@lib/components/ui/Loader';

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
  },
  {
  pathname: "/auth/oauth-callback",
  file: "OAuthCallbackPage",
  protected: false,
  }
];

export class Router {
  private app: HTMLDivElement;
  private curLocation: string;
  private routes: Map<string, Route>;
  private isInitialized = false;

  constructor(curLocation: string = window.location.pathname) {
    console.log('current location ', curLocation)
    const app = document.querySelector("#app");
    if (!app) throw new Error("FATAL: Failed to find app element");
    this.app = app as HTMLDivElement;
    this.routes = new Map();
    this.curLocation = curLocation || '/';
  }

  async init(): Promise<Router> {
    console.log('router init location: ', this.curLocation)
    try {
      let matchedRoute = routes.find(r => r.pathname === this.curLocation);
      if (!matchedRoute) matchedRoute = routes.find(r => r.pathname === '/')!;

      const route = await this.loadPage(matchedRoute);
      mount(route(), this.app);
      this.isInitialized = true;
      console.log('initialized');
    } catch (e: any) {
      console.error(`Failed to load route ${this.curLocation}`);
      mount(ErrorPage('404'), this.app);
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
      }

      const route = await this.loadPage(matchedRoute);

      if (!route) {
        throw new Error(`Failed to load location ${location}`)
      };

      if (!isPopState && location !== this.curLocation)
        history.pushState({}, '', location);

      console.log('updating route')
      setTimeout(() => {
        update(route());
      }, 400);

      this.curLocation = location;
    } catch (e: any) {
      console.error(`Routing Error: ${e.message || e}`);
      if (e.page) {
        update(e.page())
      } else {
        update(ErrorPage('404'));
      }
    }
  }

  get initialized() {
    return this.isInitialized;
  }

  get location(): string {
    return this.curLocation;
  }
}
