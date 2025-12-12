import { callbackFunction } from "../../lib/components/forms/OAuthForm";
import { div, h2 } from "@lib/vdom";

export const Page = () => {
  callbackFunction().catch(err => {
    console.error("Error. OAuth callback failed:", err);
  });

  return div({ class: "flex items-center justify-center h-full" },
    h2({ class: "text-lg font-semibold text-gray-600" }, "SignIn with GitHub in progress…" )
  );
};
