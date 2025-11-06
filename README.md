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

While developping, the command

```sh
make dev
```
or just
```sh
make
```

will run [vite](https://vite.dev/guide/), and serves files at **http://localhost:8080**;
Vite is a utility that bundles and translates our TypeScript files into JavaScript files and serves them.

This will also start the backend services in dev mode.

For production builds, we will use

```sh
make prod
```

which will start the docker compose, and run frontend and backend services in separate containers

There is also a test feature
```sh
make test
```
which doesnt work perfectly right now and will need to be maintained/extendend as new services get added.

### Submission

I think before a PR to main, test should have been written for the change. A change doesnt have to be a full module, might be just a part of a module or feature.
Also, if a new module was started / submitted, it should have a corresponding service entry in the docker compose and docker file in the service dir.
For env, maybe we just keep one the in this repo, and just dont put it into the intra repo when submitting.

Possible Workflow:
- pull changes from main into current working branch after every commit/merge to main
- run ```make install``` to sync deps
- run ```make test``` to check if all tests work after commit to main
- run ```make prod``` to check the docker setup runs ( maybe we add some ```make prod-test``` with tests for the docker setup also)
- work, work, work && write tests for changes
- when ready for PR, first run ```make test``` to run old and new tests
- if all goes well, run ```make prod``` to see that all builds as expected (evtl. ```make prod-test``` if available)
- push branch, create PR and describe changes
- some other group member reviews the PR (can be requested with github feature)
- PR gets merged, group is notified
- everybody pulls from main to sync new feature
- start from top

### Modules

#### Mandatory

- Basic Web Prerequisites 
    - Typescript
    - Docker
    - Firefox
    - SPA
    - no errors, warnings etc.
- Game
    - Pong 1v1
    - Tournament
    - registration (for tournament)
    - matchmaking system
    - same rules for all
- Security
    - passwords hashed
    - SQL injections / XSS attacks
    - https / wss
    - input validation
    - protected api (JWT or similar)
    - .env not stored in repo

#### Module List

NEEDED: 14pts mandatory + min 5 bonus

##### Legend

| Short     | Meaning                                   |
|:----------|:------------------------------------------|
|   v       | victor                                    |
|   g       | gamemaker/in                              |
|   all     | used by all members, can be dev by one    |
|   ?       | maybe                                     |

| Module    |Sub Module |short| points | total |
|:----------|:----------|:---:|:------:|------:|
|Web| | | 4|
|-|Backend Framework|all|2||
|-|Frontend Framework|v|1||
|-|Database |all|1| |
|User Management| | | |4|
|-|Standard user management|v|2||
|-|remote auth|v|2||
|Gameplay and ui| | | |2 + 3?|
|-|Remote players|g|2||
|-|Customization|g|1?||
|-|Live Chat|g?|2?||
|Ai| |g| |2 + 1?|
|-|Ai Opponent|g|2||
|-|Game stats|g|1?||
|Security| | | |2|
|-|JWT and 2FA|v|2||
|DevOps| | | |2|
|-|micro services|all|2||
|Accessibility| | | |2|
|-|Language Support| |1||
|-|Accessibility vis.| |1||
|Server-Side Pong| | | |2|
|-|Run on server|g|2||
| | | | |20 + 4?|

#### Reasoning

- web
    - Front and backend module just makes our lives easier
    - Database is basically mandatory
    - Blockchain too much of a hastle to learn (i think)
- user
    - Both auth and user management work well with database and backend module, and also cover some of securtiy part from mandatory
- game
    - Remote players works well with server side pong
    - Customization could be fairly easy, but maybe annoying as well
    - Live chat seems very complicated, but also very interesting
    - NOTE: Game might be best to be done by one person, except live chat maybe
- ai
    - Ai Opponent maybe interesting and could be combined well with the general game dev
    - Gamestats seems not too complicated but mayeb to much for 1 point
- security
    - JWT and 2FA again work well with mandatory auth, user management and remote auth
    - Other modules too much i think
- devops
    - Microservices seems like a natural way to work, especially as a team (work on one module in one service)
    - Other modules too much i think
- accesibility
    - We are allowed to use localization libs by the subject, might be fairly simple + multi lingual team :)
    - Visually imparies access. could be not too complicated, seems like simple frontend stuff, might be much though for 1 point
- server side
    - Running on server can protect from cheating/hacks, makes remote playing easier, seems natural


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
├── frontend                        # client / public code
│   ├── nginx                       # webserver
│   │   └── ...
│   ├── src
│   │   ├── routes
│   │   │   └── ...
│   │   ├── lib                     # client modules
│   │   │   └── user                # user client module
│   │   │       └── userClient.ts   # user api client
│   │   └── ...
│   ├── Dockerfile
│   └── index.html
├── scripts                         # scripts for tests usw.
│   └── ...
├── services                        # server / private code
│   ├── api                         # api service module
│   │   ├── src
│   │   │   ├── user                # user server module
│   │   │   │   └── userService.ts  # user service
│   │   │   └── index.ts
│   │   └── Dockerfile              # service-level docker file
│   └── database                    # database module
│       └── ...
├── shared                          # interfaces used in client and server modules
│   └── user
│       └── interfaces.ts
├── docker-compose.yml              # compose starts the app in production mode
└── ...
```

#### Pro's

- simple
- separated client and server code
- services grouped in one dir, frontend separate
- shared types/interfaces between server and client modules
