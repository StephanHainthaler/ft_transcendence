import { a, h1, p } from "@lib/vdom"
import { error } from "./error"
import { client } from "@lib/api/client"

export const ErrorNotLoggedIn = () => {
  client.init();
  return error(
      h1({ class: 'text-2xl font-bold text-teal-dark' }, 'Authentication Required'),
      p({ class: 'text-center text-gray-700' }, 'Please sign in to continue'),
      a({
        href: '/auth',
        class: 'btn primary px-8 py-3 rounded-lg w-full text-center font-semibold hover:opacity-90 transition-opacity'
      }, 'Sign In'),
  )
}
