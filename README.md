_This project has been created as part
of the 42 curriculum by vvobis, shaintha, khuk, pgober, juitz._

## Description

This project is called ft_transcendence and is the final projectof Coding School 42. 

The goal of this project is to create a real-world web application as a team that can move in many directions, depending on the modules the team chooses.

We decided on a web-application where you can play Pong. For further information on the modules we implemented, see section "Modules" below.
Full-stack development but also team organization, project management and establishing of roles within the team are some of the key objectives of this project.

### Roles
  
| **Person** | **Role**                                    |
|:-----------|:--------------------------------------------|
| vvobis     | Product Owner / Technical Lead / Developer  |
| shaintha   | Scrum Master / Developer                    |
| khuk       | Developer                                   |
| pgober     | Developer                                   |
| juitz      | Developer                                   |

### Modules and key features

#### Legend

| **Abbreviation**     | **Meaning**       |
|:----------|:-----------------------------|
| everyone  | developed by all members     |
|  ✅     | Done                           |
|  🚧     | In progress                    |
|  ❌     | Cancelled                      |


| Module               | Sub Module                | Framework       | Assignee       | Type  | Points   | Status |
| :---                 | :---                      |                 | :---           | :---  | :---     | :---   |
| **Web**              |                           |                 |                |       | _4_      |        |
| `-`                  | Backend Framework         | Svelte          | everyone       | Minor | 1        | 🚧     |
| `-`                  | Frontend Framework        | Fastify         | everyone       | Minor | 1        | 🚧     |
| `-`                  | User Interaction          |                 | ?              | Major | 2        | 🚧     |
| **User Management**  |                           |                 |                | _2_   | _4_      |        |
| `-`                  | Standard user management  |                 | vvobis         | Major |  2       | 🚧     |
| `-`                  | Remote authentication     |                 | pgober         | Major | 2        | 🚧     |
| **AI-Algo**          |                           |                 |                | _1.5_ | _2 + 1?_ |        |
| `-`                  | AI Opponent               |                 | pgober         | Major |  2       | ✅     |
| `-`                  |  Game stats               |                 | khuk           | Minor |  1       | 🚧     |
| **Cybersecurity**    |                           |                 |                | _1_   | _2_      |        |
| `-`                  | JWT and 2FA               |                 | vvobis & juitz | Major |  2       | 🚧     |
| **DevOps**           |                           |                 |                | _1_   | _2_      |        |
| `-`                  | Micro services            |                 | everyone       | Major |  _2_     | 🚧     |
| **Accessibility**    |                           |                 |                | _1_   | _2.5_    |        |
| `-`                  | Language Support          |                 | khuk           | Minor |  1       | 🚧     |
| `-`                  | Accessibility visual      |                 | khuk           | Minor |  1       | 🚧     |
| `-`                  | Exp. browser comp.        |                 | -              | Minor |  1       | 🚧     |
| **Server-Side Pong** |                           |                 |                | _1_   | _2_      |        |
| `-`                  | Run on server             |                 | vvobis         | Major |  2       | 🚧     |
| **TOTAL**            |                           |                 |                | _9.5_ | _20?_    |        |

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


## Instructions

### Setup

testing

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

### Development

While developing, the command

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
├── env                             # env files
│   └── ...
├── frontend                        # client / public code
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
│   ├── database                    # database module
│   │   └── ...
│   └── nginx                       # webserver
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


## Resources
