import { button, h2, div, form } from "@lib/vdom";
import { Input } from "@lib/components/ui/Input";
import { client } from "@lib/api/client";
import { validateInputThrow } from "@lib/validation/inputValidation";
import { goto } from "@lib/router";
let usernameBuffer = '';
let emailBuffer = '';
let userPasswordBuffer = '';
let userPasswordRepeatBuffer = '';
let errorMessage: string = '';

let updateFunc: (() => void) | null = null;

const handleLoginFormSubmit = async (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    const username = validateInputThrow(usernameBuffer, { type: 'username' });
    const email = validateInputThrow(emailBuffer, { type: 'email' });
    if (userPasswordBuffer !== userPasswordRepeatBuffer) throw new Error("Passwords dont match");
    await client.signup({
      username,
      email,
      passwd: userPasswordBuffer,
    });
    await goto('/');
  } catch (e: any) {
    console.error(e);
    errorMessage = e.message || e.error || JSON.stringify(e);
    console.log(errorMessage)
  } finally {
    if (updateFunc) updateFunc();
  }
}

const handleEmailInput = (e: Event) => {
  const target = e.target as HTMLInputElement | null;
  if (target) {
    emailBuffer = target.value;
    errorMessage = '';
  }
  console.log(emailBuffer);
}

const handleUsernameInput = (e: Event) => {
  const target = e.target as HTMLInputElement | null;
  if (target) {
    usernameBuffer = target.value;
  }
  console.log(usernameBuffer);
}

const handlePasswordInput = (e: Event) => {
  const target = e.target as HTMLInputElement | null;
  if (target) {
    userPasswordBuffer = target.value;
  }
  console.log(userPasswordBuffer);
}

const handlePasswordInputRepeat = (e: Event) => {
  const target = e.target as HTMLInputElement | null;
  if (target) {
    userPasswordRepeatBuffer = target.value;
  }
  console.log(userPasswordRepeatBuffer);
}

export const SignupForm = (update: () => void) => {
  updateFunc = () => { update() };
  return (
    form({ class: 'space-y-4 px-8 pt-8', onclick: updateFunc },
      div({ class: 'w-full gap-2 flex flex-col' },
        h2({ class: 'text-2xl font-bold text-teal mb-6 text-center' }, 'Register'),
        Input('Username', handleUsernameInput),
        div(),
        Input('Email', handleEmailInput, { type: 'email', autocomplete: 'off' }),
        Input('Password', handlePasswordInput, { type: 'password', autocomplete: 'new-password' }),
        Input('Password Repeat', handlePasswordInputRepeat, { type: 'password', autocomplete: 'new-password'})
      ),
      div({
        class: errorMessage.length > 0 ? 'bg-red-400 text-sm p-4 w-full shadow-md rounded-md' : 'flex flex-grow',
        replace: true,
      }, errorMessage),
      div({ class: 'px-8 mt-auto' },
        button({ onclick: handleLoginFormSubmit, class: 'btn w-full mb-8 justify-self-end' }, 'Sign up')
      )
    )
  )
}
