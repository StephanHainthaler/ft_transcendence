import { LoginForm } from "@lib/components/forms/LoginForm";
import { SignupForm } from "@lib/components/forms/SignupForm";
import type { Route } from "@lib/types/route";
import { div, button, update } from "@lib/vdom";

const LOGIN = 0;
const REGISTER = 1;
let selectedTab: number = LOGIN;

const tabClassSelected = 'flex-1 py-3 px-4 bg-cream text-teal-dark hover:bg-tan-border transition-colors'
const tabClass = 'flex-1 py-2 px-4 rounded bg-tan text-teal-dark hover:bg-tan-border'

const setLoginForm = () => {
  selectedTab = LOGIN;
  update(Page());
}

const setRegisterForm = () => {
  selectedTab = REGISTER;
  update(Page());
}

const updatePage = () => {
  update(Page());
}

export const Page: Route = () => {
  const page =
    div({ class: 'size-full flex flex-col items-center justify-start background' },
      div({ class: 'card shadow-lg mt-[5%] md:mt-[10%] h-fit min-h-[50%] min-w-[300px] w-[30%] p-0 overflow-hidden' },
        div({ class: 'flex w-full border-b-2 border-tan' },
          button({
            class: selectedTab === LOGIN ? tabClassSelected : tabClass,
            onclick: setLoginForm
          }, 'Login'),
          button({
            class: selectedTab === REGISTER ? tabClassSelected : tabClass,
            onclick: setRegisterForm
          }, 'Register')
        ),
        selectedTab === LOGIN ? LoginForm(updatePage) : SignupForm(updatePage)
      )
    )
  return page;
}
