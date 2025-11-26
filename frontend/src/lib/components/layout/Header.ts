import { a, button, div, h1, nav, updateId } from "@lib/vdom"
import { client } from "@lib/index";

const updateHeader = () => {
  updateId(HeaderDropDown());
}

client?.onChange(updateHeader);

const toggleMenu = () => shouldExpandMenu = !shouldExpandMenu;

const dropdownMenu = () => {
  return (
    div({
      class: 'w-48 bg-white text-teal text-left transition-all \
            duration-300 rounded-lg shadow-lg absolute right-0 mt-2 z-9999 py-1 '
          + (shouldExpandMenu ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'),
      onclick: toggleMenu,
    },
    ...(client?.isLoggedIn
      ? [
        a({ class: 'block m-2 px-4 py-2 rounded-lg hover:bg-gray-100', href: '/user'}, 'Profile'),
        a({ class: 'block m-2 px-4 py-2 rounded-lg hover:bg-gray-100', href: '/game'}, 'Game'),
        a({ class: 'block m-2 px-4 py-2 rounded-lg hover:bg-gray-100', href: '/tournament'}, 'Tournament'),
        a({ class: 'block m-2 px-4 py-2 rounded-lg hover:bg-gray-100', href: '/friend'}, 'Friends'),
        a({ class: 'block m-2 px-4 py-2 rounded-lg hover:bg-gray-100', onclick: () => { client.logout() } }, 'Logout'),
      ]
      : [
        a({ class: 'block m-2 px-4 py-2 rounded-lg hover:bg-gray-100', href: '/auth' }, 'Login'),
      ]
    ))
  )
}

let shouldExpandMenu = false;

export const HeaderDropDown = () => {
  return (
    div({
      id: 'dyn-header-component',
      class: 'flex flex-col place-items-center relative',
      onmouseenter: () => { shouldExpandMenu = true, updateId(HeaderDropDown()) },
      onmouseleave: () => { shouldExpandMenu = false, updateId(HeaderDropDown()) },
    },
      button({ class: 'btn', onclick: () => toggleMenu }, "Menu",
        dropdownMenu()
      )
    )
  )
}

export const Header = () => {
  return (
    nav({
      class: "flex flex-row justify-between items-center w-full px-6 py-4 bg-teal shadow-md",
      id: "header"
    }, div ({ class: "flex items-center" },
        h1({ class: 'text-2xl font-bold text-white' },
          a({ href: '/', class: 'hover:text-cream transition-colors' }, "Transcendence"),
        ),
      ),
      HeaderDropDown()
    )
  )
}
