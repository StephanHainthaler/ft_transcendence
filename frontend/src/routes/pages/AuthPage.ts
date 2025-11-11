import type { Route } from "@lib/types/route";
import { button, div, form, input, label, update } from "@lib/vdom";

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

let selectedTab: number = 0;

const REGISTER_FORM = div({ class: 'flex flex-col gap-4' },
  label({ for: 'input-register-username' }, 'Username'),
  input({ id: "input-register-username", class: "bg-white", onchange: handleUsernameInput, type: "text" }),
  label({ for: 'input-register-password' }, 'Password'),
  input({ id: "input-register-password", class: "bg-white", onchange: handlePasswordInput, type:"password" }),
  label({ for: 'input-register-password-repeat' }, 'Password Repeat'),
  input({ id: "input-register-password-repeat", class: "bg-white", onchange: handlePasswordInputRepeat, type: "password" }),
)

const LOGIN_FORM = div({ class: "flex flex-col gap-4" },
  label({ for: 'input-signin-username' }, 'Username'),
  input({ id: 'input-signin-username', type: 'text', onchange: handleUsernameInput, class: 'bg-white' }),
  label({ for: 'input-signin-password' }, 'Password'),
  input({ id: 'input-signin-password', type: 'text', onchange: handlePasswordInput, class: 'bg-white' }),
)

const setLoginForm = () => {
  selectedTab = 0;
  update(Page());
}

const setRegisterForm = () => {
  selectedTab = 1;
  update(Page());
}

export const Page: Route = () => {
  const page = div({ class: 'size-full flex flex-col place-items-center justify-center' },
    div( { class: 'grid grid-col-1 h-[60%] w-[40%] items-center justify-center gap-4'},
      div({ class: 'flex w-full p-4 gap-4 place-items-center place-self-start justify-center flex-row justify-self-start' },
        button({ class: selectedTab === 0 ? 'bg-white' : 'bg-gray', onclick: setLoginForm}, 'Login'),
        button({ class: selectedTab === 1 ? 'bg-white' : 'bg-gray', onclick: setRegisterForm}, 'Register')),
      form({ type: 'submit' },
        selectedTab === 0 ? LOGIN_FORM : REGISTER_FORM,
      )
    )
  )
  return page;
}
