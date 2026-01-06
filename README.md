_This project has been created as part
of the 42 curriculum by vvobis, shaintha, khuk, pgober, juitz._

## Description

This project is called ft_transcendence and is the final projectof Coding School 42. 

The goal of this project is to create a real-world web application as a team that can move in many directions, depending on the modules the team chooses.

We decided on a web-application where you can play Pong. For further information on the modules we implemented, see section "Modules" below.
Full-stack development but also team organization, project management and establishing of roles within the team are some of the key objectives of this project.

### Roles and Team Information
  
| **Person** | **Role**                                    | **Responsibilities**                        |
|:-----------|:--------------------------------------------|:--------------------------------------------|
| vvobis     | Product Owner / Technical Lead / Developer  | Decision on features and priorities, Validate completed work & Review critical code changes, Make technology stack decisions   |
| shaintha   | Scrum Master / Developer                    | Organization of team meetings, Ensure team communication  |
| khuk       | Developer                                   | Write code for assigned features, Testing  |
| pgober     | Developer                                   | Write code for assigned features, Testing, Documentation  |
| juitz      | Developer                                   | Write code for assigned features, Testing  |

## Modules and key features

| **Abbreviation**     | **Meaning**                  |
|:----------           |:------------------           |
|  ✅                 | Done                         |
|  🚧                 | In progress                  |
|  ❌                 | Cancelled                    |

| **Module**           | **Sub Module**            |**Framework / Info**| **Assignee**    | **Type**| **Points** | **Status** |  **Reasoning**            |
| :---                 | :---                      |  :---              | :---            | :---    | :---       | :---       |   :---                    |
| **Web**              |                           |                    |                 |         |            |            |                           |
| `-`                  | Backend Framework         | Svelte             | everyone        | Minor   | 1          | 🚧        | Frontend and Backend module just makes our lives easier |
| `-`                  | Frontend Framework        | Fastify            | everyone        | Minor   | 1          | 🚧        | Frontend and Backend module just makes our lives easier |
| `-`                  | User Interaction          |                    |                 | Major   | 2          | 🚧        |                           |
| **Accessibility**    |                           |                    |                 |         |            |            |                           |
| `-`                  | Language Support          |                    | khuk            | Minor   | 1          | 🚧        | We are allowed to use localization libs by the subject, might be fairly simple + multi lingual team :) |
| `-`                  | Browser compatility       |                    | -               | Minor   | 1          | 🚧        | Different users use prefer different browsers    |
| **User Management**  |                           |                    |                 |         |            |            |                           |
| `-`                  | Standard user management  |                    | vvobis          | Major   | 2          | 🚧        | Works well with database and backend module |
| `-`                  | Game stats                |                    | khuk            | Minor   | 1          | 🚧        | Seems not too complicated |
| `-`                  | Remote authentication     | OAuth 2.0 (GitHub) | pgober          | Minor   | 1          | ✅        | Works well with database and backend module |
| `-`                  | JWT and 2FA               |                    | vvobis & juitz  | Major   | 2          | 🚧        | Works well with mandatory auth, user management and remote auth |
|**AI-Algorithm**      |                           |                    |                 |         |            |            |                           |
| `-`                  | AI Opponent               |                    | pgober          | Major   | 2          | 🚧        | Interesting and could be combined well with the general game dev |
| **Gaming**           |                           |                    |                 |         |            |            |                           |
| `-`                  | Web-based game            | Pong               | shaintha & juitz| Major   | 2          | 🚧        |                           |
| `-`                  | Tournament system         |                    |                 | Minor   | 1          | 🚧        |                           |
| **DevOps**           |                           |                    |                 |         |            |            |                           |
| `-`                  | Backend as microservices  |                    | everyone        | Major   | 2          | 🚧        | Seems like a natural way to work, especially as a team (work on one module in one service) |
| **Modules of Choice**|                           |                    |                 |         |            |            |                           |
| `-`                  | Run on Server             |                    | vvobis          | Major   | 2          | 🚧        | Running on server can protect from cheating/hacks, makes remote playing easier, seems natural |
| `-`                  | Visually imparies access   |                   | vvobis          | Major   | 2          | 🚧        | Not too complicated, seems like simple frontend stuff, too much though for 1 point |
| **TOTAL**            |                           |                    |                 |         | _20_       |            |                           |

### Decision against Modules

#### Web
    - Blockchain too much of a hastle to learn (i think)
    
#### Gaming
    - Remote players works well with server side pong
    - Customization could be fairly easy, but maybe annoying as well
    - Live chat seems very complicated, but also very interesting
    - NOTE: Game might be best to be done by one person, except live chat maybe
  
#### DevOps
    - Other modules too much
    

## Instructions

### Setup & Installation

First you need to install [nvm, node and npm](https://nodejs.org/en/download) for you OS.

Then in the root of the project, run

```sh
make install
```

This will install all the dependencies we added to the project, which are described in the package.json file

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

#### Dependencies
- vite
- tailwindcss
- fastify
- etc...

### Compilation and Execution

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

## Project Management & Team Collaboration

Before a PR to main, test should have been written for the change. A change doesnt have to be a full module, might be just a part of a module or feature.
Also, if a new module was started / submitted, it should have a corresponding service entry in the docker compose and docker file in the service dir.
For env, maybe we just keep one the in this repo, and just dont put it into the intra repo when submitting.

Workflow:
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
