import { div, h1, p } from "@lib/vdom";
import type { Route } from "@lib/types/route";
import { Layout } from "@lib/components/layout";
import { callbackFunction } from "@lib/components/forms/OAuthForm";

export const Page: Route = () => {
  // ✅ run ONCE when route is entered
  callbackFunction()
    .then(() => {
      window.location.replace("/");
    })
    .catch(err => {
      console.error(err);
      window.location.replace("/login?error=oauth");
    });

  return Layout(
    div(
      { class: "w-full flex flex-col items-center justify-center" },
      h1({ class: "text-lg font-semibold" }, "Signing you in…"),
      p({ class: "text-sm opacity-70" }, "Please wait while we complete authentication.")
    )
  );
};
