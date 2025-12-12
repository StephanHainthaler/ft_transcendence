import { LoginForm, SignupForm, OAuthForm } from "@lib/components/forms";
import { Layout } from "@lib/components/layout";
import type { Route } from "@lib/types/route";
import { div, button, updateId } from "@lib/vdom";

const LOGIN = 0;
const REGISTER = 1;
const OAUTH = 2;
let selectedTab: number = LOGIN;

const tabClassSelected = 'flex-1 py-3 px-4 bg-tan text-teal-dark hover:bg-tan-border transition-colors'
const tabClass = 'flex-1 py-2 px-4 rounded bg-cream text-teal-dark hover:bg-tan-border'

const setLoginForm = () => {
  selectedTab = LOGIN;
  updateId(PageContent());
}

const setRegisterForm = () => {
  selectedTab = REGISTER;
  updateId(PageContent());
}

const setOAuthForm = () => {
  selectedTab = OAUTH;
  updateId(PageContent());
}

const updatePage = () => {
  updateId(PageContent());
}


const PageContent = () => {
  let method;
  switch (selectedTab) {
    case LOGIN:
      method = LoginForm(updatePage);
      break;
    case REGISTER:
      method = SignupForm(updatePage);
      break;
    case OAUTH:
      method = OAuthForm(updatePage);
  }
  return (
    div({ id: 'dyn-auth-page', class: 'size-full flex flex-col items-center justify-start background' },
      div({
        class: 'card bg-tan shadow-lg flex flex-col mt-[5%] md:mt-[10%] h-fit \
        min-h-[50%] min-w-[300px] w-[30%] p-0 overflow-hidden'
      },
        div({ class: 'flex w-full border-b-2 border-tan' },
          button({
            class: selectedTab === LOGIN ? tabClassSelected : tabClass,
            onclick: setLoginForm
          }, 'Login'),
          button({
            class: selectedTab === REGISTER ? tabClassSelected : tabClass,
            onclick: setRegisterForm
          }, 'Register'),
          button({
            class: selectedTab === OAUTH ? tabClassSelected : tabClass,
            onclick: setOAuthForm
          }, 'OAuth')
        ),
        method
      )
    )
  )
}

export const Page: Route = () => {
  return Layout(
    PageContent()
  )
}
