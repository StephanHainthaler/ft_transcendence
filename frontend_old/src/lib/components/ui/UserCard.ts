import type { User } from "@shared/user";
import { p, div, button, type Child } from "@lib/vdom";

export const UserCard = (user: User, btnDescription: string, callback: (u: User) => void, ...children: Child[]) => {
  if (!user) return;
  return (
    div({ replace: true, class: 'border-1 overflow-hidden border-teal-dark text-teal-dark bg-neutral-100 text-lg w-full h-fit p-1 px-2 rounded-md flex items-center justify-between' },
      div({ class: "flex gap-4 w-[50%] justify-between" },
        p({ class: 'text-left' }, `${user.name}`), p({ class: 'text-left text-mint' }, `@${user.username || user.email}`),
      ),
      div({ class: 'w-full justify-end gap-4 items-end flex flex-row' },
        button({ class: 'btn sm secondary', onclick: () => callback(user) }, btnDescription),
        ...children,
      )
    )
  )
}
