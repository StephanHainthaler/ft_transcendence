import type { Route } from "@lib/types/route";
import { button, h2, div, form, update } from "@lib/vdom";
import { Input } from "@lib/components/Input";

let usernameBuffer = '';
let userPasswordBuffer = '';
let userPasswordRepeatBuffer = '';

const handleUsernameInput = (e: Event) => {
  const target = e.target as HTMLInputElement | null;
  if (target)
    usernameBuffer = target.value;
  console.log(usernameBuffer);
}

const handlePasswordInput = (e: Event) => {
  const target = e.target as HTMLInputElement | null;
  if (target)
    userPasswordBuffer = target.value;
  console.log(userPasswordBuffer);
}

const handlePasswordInputRepeat = (e: Event) => {
  const target = e.target as HTMLInputElement | null;
  if (target)
    userPasswordRepeatBuffer = target.value;
  console.log(userPasswordRepeatBuffer);
}

const LOGIN_FORM =
div({ class: 'p-8 w-full max-w-md' },
  h2({ class: 'text-2xl font-bold text-teal mb-6 text-center' }, 'Sign in'),
  Input('Email or Username', handleUsernameInput),
  Input('Password', handlePasswordInput, { type: 'password' }),
)

const REGISTER_FORM =
div({ class: 'p-8 w-full max-w-md' },
  h2({ class: 'text-2xl font-bold text-teal mb-6 text-center' }, 'Register'),
  Input('Email or Username', handleUsernameInput),
  Input('Password', handlePasswordInput, { type: 'password' }),
  Input('Password Repeat', handlePasswordInputRepeat, { type: 'password' })
)

const setLoginForm = () => {
  selectedTab = LOGIN;
  update(Page());
}

const setRegisterForm = () => {
  selectedTab = REGISTER;
  update(Page());
}

const LOGIN = 0;
const REGISTER = 1;
let selectedTab: number = LOGIN;

const tabClassSelected = 'flex-1 py-3 px-4 bg-cream text-teal-dark hover:bg-tan-border transition-colors'
const tabClass = 'flex-1 py-2 px-4 rounded bg-tan text-teal-dark hover:bg-tan-border'
export const Page: Route = () => {
  const page =
    div({ class: 'size-full flex flex-col items-center justify-center background' },
      div({ class: 'card shadow-lg h-[50%] min-w-[300px] w-[30%] p-0 overflow-hidden' },
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
        form({ class: 'space-y-4 px-8' },
          selectedTab === 0 ? LOGIN_FORM : REGISTER_FORM,
          div({ class: 'px-8' },
            button({ type: 'submit', class: 'btn w-full justify-self-end' }, selectedTab === LOGIN ? 'Sign in' : 'Sign up')
          )
        )
      )
    )
  return page;
}
