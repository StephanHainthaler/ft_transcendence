import { Input } from "@lib/components/ui/Input";
import { Separator } from "@lib/components/ui/Seperator";
import type { Route } from "@lib/types/route";
import { client } from "@lib/api/index.svelte";
import { button, div, form, h1, h2, updateId, type VNode } from "@lib/vdom";
import type { AuthUserClient, User } from "@shared/user";
import { Layout } from "@lib/components/layout";
let editMode: boolean = false;

type ProfilePageData = {
  auth: AuthUserClient,
  user: User,
  passwd: string,
  passwdRepeat: string,
}

let session: ProfilePageData;

client.onChange(() => (console.log('notifying profile form'), updateId(ProfileFormDiv())));

export const Page: Route = () => {
  if (!session) {
    session = {
      auth: client.auth!,
      user: client.user!,
      passwd: '',
      passwdRepeat: ''
    };
  }
  return Layout(
    form({
      id: 'dyn-profile-form',
      class: 'page-container',
      onsubmit: (e: Event) => { e.preventDefault() },
    },
      ProfileFormDiv(),
    )
  )
}

const userPersonalInfo = (session: ProfilePageData) => {
  return (
    div({ class: 'mt-8' },
      div({ class: 'flex justify-between items-center' },
        h2({ class: 'text-lg' }, 'Personal Info'),
        button({
          class: `btn text-sm ${editMode ? 'secondary' : ''} `,
          onclick: () => {editMode = !editMode, updateId(ProfileFormDiv())},
        }, 'Edit'),
      ),
      Separator({ class: 'my-2 border-teal-600' }),
      div({ class: 'grid grid-col-2' },
        Input('Display Name',
          (e) => session.user.name = (e.target as HTMLInputElement).value,
          { value: session.user.name, ...(!editMode ? { disabled: '' } : {}) }
        ),
      )
    )
  )
}

const userAuthenticationInfo = (userCred: AuthUserClient & { passwd: string, passwdRepeat: string }) => {
  return (
    div({ class: 'mt-8' },
      div({ class: 'flex justify-between items-center' },
        h2({ class: 'text-lg' }, 'Credentials'),
      ),
      Separator({ class: 'my-2 border-teal-600' }),
      div({ class: 'grid grid-cols-2 gap-4' },
        Input('Username',
          (e: Event) => userCred.username = (e.target as HTMLInputElement).value,
          { value: userCred.username || '', ...(!editMode ? { disabled: '' } : {}) }
        ),
        Input('Email',
          (e: Event) => userCred.email = (e.target as HTMLInputElement).value,
          { value: userCred.email || '', ...(!editMode ? { disabled: '' } : {}) }
        ),
        Input('Password',
          (e: Event) => userCred.passwd = (e.target as HTMLInputElement).value, {
            placeholder: '********',
            type: 'password',
            autofill: 'new-password',
            ...(!editMode ? { disabled: '' } : {})
          }
        ),
        Input('Repeat Password',
          (e: Event) => userCred.passwdRepeat = (e.target as HTMLInputElement).value, {
            placeholder: '********',
            type: 'password',
            autofill: 'new-password',
            ...(!editMode ? { disabled: '' } : {})
          }
        ),
      )
    )
  )
}

const ProfileFormDiv: () => VNode = () => {
  return (
    div({ id: 'dyn-profile-form-div', class: 'card bg-tan p-4 flex w-full flex-grow flex-col', onclick: () => updateId(ProfileFormDiv()) },
      h1({ class: 'text-3xl' }, 'Profile'),
      Separator(),
        div({},
          userPersonalInfo(session),
          userAuthenticationInfo({...session.auth, passwd: '', passwdRepeat: ''}),
          div({ class: 'mt-auto flex justify-end' },
            button({ class: 'btn' }, 'Submit Changes'),
          ),
        )
    )
  )
}
