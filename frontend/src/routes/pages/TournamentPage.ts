import { client } from "@lib/api/client";
import { Separator } from "@lib/components/ui";
import { UserCard } from "@lib/components/ui/UserCard";
import { Tournament } from "@lib/tournament/tournament";
import type { Route } from "@lib/types/route";
import { button, canvas, div, h1, h2, p, updateId } from "@lib/vdom";
import type { Game, User } from "@shared/user";

let availableUsers: User[] = await client.getUsers();
let selectedUsers: User[] = [];

let tournament: Tournament = new Tournament();
let schedule: Game[] = [];
let nextSchedule: Game[] = [];

const NextGamePopup = () => {
  const nextGame = tournament.nextGame();
  const player1 = tournament.players.find(u => u.id === nextGame?.player1)!;
  const player2 = tournament.players.find(u => u.id === nextGame?.player2)!;
  return (
    div({
      class: 'absolute top-0 z-50 text-mint flex flex-col items-center justify-center left-0 size-full bg-white/30' + (tournament.inGame ? ' hidden' : '')
    },
      h2({ class: 'text-center text-5xl font-bold' }, 'Next Up:'),
      div({ class: 'p-32 flex flex-row grid grid-cols-3 w-full justify-between' },
        div({ class: '' },
          p({ class: 'text-mint text-9xl font-bold text-center' }, player1.name),
        ),
        p({ class: 'text-center font-bold text-9xl' }, '-'),
        div({ class: '' },
          p({ class: 'text-mint text-9xl font-bold text-center' }, player2.name),
        )
      ),
      button({ class: 'btn primary', onclick: () => (tournament.inGame = true, updateContainer()) }, 'start!'),
    )
  )
}

const gameCard = (game: Game, players: User[]) => {
  const player1 = players.find(u => u.id === game.player1)!;
  const player2 = players.find(u => u.id === game.player2);
  return (
    div({ class: 'border-1 overflow-hidden border-teal-dark text-teal-dark bg-neutral-100 text-lg w-full h-fit p-1 px-2 rounded-md flex items-center justify-between' },
      div({ class: "flex gap-4 w-full justify-between" },
        p({ class: 'text-left' }, player1.name),
        ...(player2 !== undefined
          ? ([
            p({ class: 'text-center' }, 'vs.'), p({ class: 'text-right text-mint' }, player2!.name)
          ])
          : ''
        )
      ),
    )
  )
}

let showSidebar = false;

const ScheduleSidebar = () => {
  nextSchedule = tournament.getNextSchedule();
  console.log(nextSchedule);
  return (
    [button({
      class: 'btn sm absolute top-4 right-4 z-[60]',
      onclick: () => { showSidebar = !showSidebar, updateContainer() }
    }, 'Sidebar'),
      div({
        class: 'absolute top-8 p-2 right-0 z-60 w-[30%] overflow-hidden rounded-md h-[90%] transition-transform duration-300'
          + (showSidebar ? ' translate-x-0' : ' translate-x-full')
      },
        div({ class: 'bg-green-300 size-full rounded-md' },
          button({
            class: 'btn secondary',
            onclick: () => { tournament.stop(), updateContainer() }
          }, 'Stop'),
          div({ class: 'flex-1 flex-col gap-2 p-4' },
            'Current',
            ...schedule.map(g => gameCard(g, tournament.players)),
            'Next',
            ...nextSchedule.map(g => gameCard(g, tournament.nextPlayers)),
          )
        )
      )]
  )
}

const TournamentRunning = () => {
  if (tournament.running) {
    // Handle Rendering and state here
  }
  return (
    div({ class: 'overflow-hidden relative card bg-tan relative size-full p-4 text-teal-dark' },
      canvas({ id: 'pong-game-canvas', class: 'w-full h-full bg-black' }),
      ...ScheduleSidebar(),
      NextGamePopup()
    )
  )
}

const TournamentSetup = () => {
  return (
    div({ class: 'card bg-tan space-y-2 size-full p-4 text-teal-dark overflow-hidden' },
      h1({ class: 'text-3xl text-center w-full' }, 'Tournament'),
      div({ class: 'flex flex-col gap-1 h-[80%] min-h-[80%] md:h-[30%] md:min-h-[30%]' },
        h2({ class: 'px-2 font-bold text-left text-2xl' }, 'Players'),
        Separator({ class: 'mt-0 mb-4' }),
        SelectedPlayersGrid(),
      ),
      Separator(),
      div({ class: 'w-full flex items-center justify-center' },
        StartTournamenButton()
      )
    )
  )
}

const StartTournamenButton = () => {
  return (
    button(
      {
        id: 'dyn-start-tournament-button',
        class: 'btn primary',
        onclick: startTournament,
        ...(selectedUsers.length < 2 ? { disabled: false } : {})
      },
      selectedUsers.length < 2 ? `Select ${2 - selectedUsers.length} more player(s)` : 'Play!',
    )
  )
}

const toggleUserSelected = (user: User) => {
  if (availableUsers.some(u => u.id === user.id)) {
    availableUsers = availableUsers.filter(u => u.id !== user.id);
    selectedUsers = [...selectedUsers, user];
  } else if (selectedUsers.some(u => u.id === user.id)) {
    selectedUsers = selectedUsers.filter(u => u.id !== user.id);
    availableUsers = [...availableUsers, user];
  }
  updateId(SelectedPlayersGrid(), StartTournamenButton());
}

const startTournament = () => {
  console.log('starting tournament with ', selectedUsers);
  tournament.players = selectedUsers;
  schedule = tournament.getSchedule();
  tournament.start();
  updateContainer();
}

const SelectedPlayersGrid = () => {
  return (
    div({ id: 'dyn-tournament-users-select', class: 'flex flex-col overflow-y-scroll md:grid md:grid-cols-2 gap-4 h-full' },
      div({
        class: 'bg-sage max-h-full p-2 flex flex-col gap-1 opacity-60 rounded-md border-teal border-1 h-full overflow-y-scroll'
      },
        ...(availableUsers.map(u => UserCard(u, 'Add', toggleUserSelected))),
      ),
      div({
        class: 'bg-sage max-h-full p-2 flex flex-col gap-1 opacity-60 rounded-md border-teal border-1 h-full overflow-y-scroll'
      },
        ...(selectedUsers.map(u => UserCard(u, 'Remove', toggleUserSelected))),
      )
    )
  )
}

const updateContainer = () => {
  updateId(Page())
}

export const Page: Route = () => {
  return (
    div({ id: 'dyn-tournament-container', class: 'size-full box-border' },
      tournament.running
        ? div({ class: 'p-[5%] size-full overflow-hidden' },
            div({ class: 'card size-full bg-tan'},
              TournamentRunning(),
            )
          )
        : div({ class: 'page-container'},
          TournamentSetup()
        )
    )
  )
}