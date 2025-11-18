import { button, h2, div, form, type VNode } from "@lib/vdom";
import { Input } from "@lib/components/ui/Input";
import { client } from "@lib/api/client";
import { validateInput } from "@lib/validation/inputValidation";
import { goto } from "@lib/router";

let usernameBuffer = '';
let userPasswordBuffer = '';
let errorMessage: string = '';
let updateFunc: (() => void) | null = null;

const handleLoginFormSubmit = async (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    const email = validateInput(usernameBuffer, { type: 'email' }).input;
    const username = validateInput(usernameBuffer, { type: 'username' }).input;
    await client.login({
      username,
      email,
      passwd: userPasswordBuffer,
    });
    await goto('/');
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
    console.log(userPasswordBuffer);
    errorMessage = '';
  }
}

export const LoginForm = (update: () => void): VNode => {
  updateFunc = update;
  return (
    form({ class: 'space-y-4 flex flex-grow flex-col px-8 pt-8', onclick: () => { errorMessage = '', update() } },
      div({ class: 'w-auto gap-2 flex items-center flex-col' },
        h2({ class: 'text-2xl font-bold text-teal mb-6 text-center' }, 'Sign in'),
        Input('Email or Username', handleUsernameInput),
        Input('Password', handlePasswordInput, { type: 'password'}),
      ),
      div({
        class: errorMessage.length > 0 ? 'bg-red-400 text-sm p-4 w-full shadow-md rounded-md' : 'flex-grow'
      }, errorMessage),
      div({ class: 'px-8 mt-auto' },
        button({ id: 'sign-in-button', onclick: handleLoginFormSubmit, class: 'btn w-full mb-8' }, 'Sign in')
      ),
    )
  )
}
