import { button, h2, div, form, type VNode } from "@lib/vdom";
import { Input } from "@lib/components/Input";
import { authClient } from "@lib/auth/authClient";
import type { User } from "@shared/user";
import { validateInput } from "@lib/validation/inputValidation";

let usernameBuffer = '';
let userPasswordBuffer = '';
let errorMessage: string = '';
let updateFunc: (() => void) | null = null;

const handleLoginFormSubmit = async (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  let user: User;
  try {
      const email = validateInput(usernameBuffer, { type: 'email' }).input;
      const username = validateInput(usernameBuffer, { type: 'username' }).input;
      user = await authClient.login({
        username,
        email,
        passwd: userPasswordBuffer,
      });
      console.log("User after login request: ", user);
  } catch (e: any) {
    errorMessage = e.message || e.toString();
  } finally {
    if (updateFunc) updateFunc();
  }
}

const handleUsernameInput = (e: Event) => {
  const target = e.target as HTMLInputElement | null;
  if (target) {
    usernameBuffer = target.value;
    errorMessage = '';
  }
}

const handlePasswordInput = (e: Event) => {
  const target = e.target as HTMLInputElement | null;
  if (target) {
    userPasswordBuffer = target.value;
    errorMessage = '';
  }
}

export const LoginForm = (update: () => void): VNode => {
  updateFunc = update;
  return (
    form({ class: 'space-y-4 px-8 pt-8' },
      div({ class: 'w-full max-w-md' },
        h2({ class: 'text-2xl font-bold text-teal mb-6 text-center' }, 'Sign in'),
        Input('Email or Username', handleUsernameInput),
        Input('Password', handlePasswordInput, { type: 'password' }),
      ),
      div(errorMessage.length > 0 ? { class: 'bg-red-400 text-xs p-4 w-full shadow-md rounded-md' } : {}, errorMessage),
      div({ class: 'px-8' },
        button({ id: 'sign-in-button', onclick: handleLoginFormSubmit, class: 'btn w-full mb-8' }, 'Sign in')
      ),
    )
  )
}
