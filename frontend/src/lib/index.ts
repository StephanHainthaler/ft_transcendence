import { ApiClient } from "./api";
import { Router } from "./router";

export const router = new Router();
export const client = new ApiClient();

export const goto = async (path: string) => {
  await router.goto(path);
}
export const refresh = async () => {
  await router.refresh();
}
