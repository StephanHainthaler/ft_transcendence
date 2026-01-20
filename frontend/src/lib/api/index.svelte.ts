// place files you want to import through the `$lib` alias in this folder.
import { ApiClient } from "./client.svelte";

export const client = $state(await new ApiClient().init());
