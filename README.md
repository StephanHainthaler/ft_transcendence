# ft_transcendence

## Description

ft_transcendence ecole42 final project

## Usage

### Setup

First you need to install [nvm, node and npm](https://nodejs.org/en/download) for you OS.

Then in the root of the project, run

```sh
make install
```

this will install all the dependencies we added to the project, which are described in the package.json file

npm is the Node.js Package Manager, and is the main utility to install and use javascript modules.
When adding a package with

```sh
npm add package-xzy
```

npm will modify the package.json and add the new dependency.
This means, that after you pull from main branch after somebody merged a PR, you should rerun

```sh
make install
```

to sync installed dependencies, in case anybody added new ones.

### Developpment

While testing, the command

```sh
npm run dev
```

will run [vite](https://vite.dev/guide/), and serves files at **http://localhost:5173**.
Vite is a utility that bundles and translates our TypeScript files into JavaScript files and serves them.

For production builds, we will use

```sh
make prod
```

which will start the docker compose, and run both frontend and backend in separate containers

#### Module List

- Web []
- User Management []
- etc...

#### Dependencies
Full list of our dependencies to keep track (we probably dont want to lose ueberblick)

- vite
- tailwindcss
- fastify
- etc...

### Structure

Possible project structure:

```
ft_transcendence/
├── backend                     # server / private code
│   ├── src
│   │   ├── user                # user server module
│   │   │   └── userService.ts  # user backend service
│   │   └── index.ts
│   └── Dockerfile
├── frontend                    # client / public code
│   ├── nginx
│   │   └── nginx.conf
│   ├── src
│   │   ├── routes
│   │   ├── user                # user client module
│   │   │   └── userClient.ts   # user api client
│   │   ├── app.css
│   │   └── index.ts            # 'entrypoint'
│   ├── Dockerfile
│   └── index.html
├── shared                      # shared files
│   └── user
│       └── interfaces.ts       # interfaces used in client and server modules
├── docker-compose.yml
├── Makefile
└── README.md
```

#### Pro's

- simple
- separated client and server code
- shared types/interfaces between server and client modules
