_This project has been created as part of the 42 curriculum by vvobis, shaintha, khuk, pgober, juitz._

## Description

This project is called ft_transcendence and is the final project of Coding School 42. 

Full-stack development but also team organization, project management and establishing of roles within the team are some of the key objectives of this project.

The goal of this project is to create a real-world web application as a team that can move in many directions, depending on the modules the team chooses.

### Pongopolis / Pongantic / Pongtastic (TBD!!!!!)
We decided on a web-application where you can play Pong. In the following subsection you can find the Modules and key features:

#### Modules and Technical Stack

| **Abbreviation**     | **Meaning**                  |
|:----------           |:------------------           |
|  ✅                 | Done                         |
|  🚧                 | In progress                  |
|  ❌                 | Cancelled                    |

| **Module**           | **Sub Module**            |**Framework / Info**| **Assignee**    | **Type**| **Points** | **Status** |  **Reasoning**            |
| :---                 | :---                      |  :---              | :---            | :---    | :---       | :---       |   :---                    |
| **Web**              |                           |                    |                 |         |            |            |                           |
| `-`                  | Backend Framework         | Svelte             | everyone        | Minor   | 1          | ✅        | Frontend and Backend module just makes our lives easier |
| `-`                  | Frontend Framework        | Fastify            | everyone        | Minor   | 1          | ✅        | Frontend and Backend module just makes our lives easier |
| `-`                  | ORM Database              |                    | vvobis          | Minor   | 1          | ✅        |                           |
| **Accessibility**    |                           |                    |                 |         |            |            |                           |
| `-`                  | Language Support          |                    | khuk            | Minor   | 1          | ✅        | We are allowed to use localization libs by the subject, might be fairly simple + multi lingual team :) |
| `-`                  | Browser compatility       |                    | everyone        | Minor   | 1          | ✅        | Different users use prefer different browsers    |
| **User Management**  |                           |                    |                 |         |            |            |                           |
| `-`                  | Standard user management  |                    | vvobis          | Major   | 2          | ✅        | Works well with database and backend module |
| `-`                  | Game stats                |                    | khuk            | Minor   | 1          | ✅        | Seems not too complicated |
| `-`                  | Remote authentication     | OAuth 2.0 (GitHub) | pgober          | Minor   | 1          | ✅        | Works well with database and backend module |
| `-`                  | JWT and 2FA               |                    | vvobis & juitz  | Minor   | 1          | ✅        | Works well with mandatory auth, user management and remote auth |
|**AI-Algorithm**      |                           |                    |                 |         |            |            |                           |
| `-`                  | AI Opponent               | Mathematical Algorithm  | pgober          | Major   | 2          | ✅        | Interesting and could be combined well with the general game dev |
| **Gaming**           |                           |                    |                 |         |            |            |                           |
| `-`                  | Web-based game            | Pong               | shaintha & juitz| Major   | 2          | ✅        |                           |
| `-`                  | Tournament system         |                    | vvobis          | Minor   | 1          | ✅        |                           |
| **DevOps**           |                           |                    |                 |         |            |            |                           |
| `-`                  | Backend as microservices  |                    | everyone        | Major   | 2          | ✅        | Seems like a natural way to work, especially as a team (work on one module in one service) |
| **Modules of Choice**|                           |                    |                 |         |            |            |                           |
| `-`                  | Custom ORM                |                    | vvobis          | Minor   | 1          | ✅        |                           |
| **TOTAL**            |                           |                    |                 |         | _18_       |            |                           |

### Database Schema

The application uses three separate SQLite databases managed by microservices:

#### 1. User Service Database (`services/user`)

Manages user accounts, profiles, avatars, games, and friend relationships.

**Tables:**

| Table | Primary Key | Columns | Description |
|-------|-------------|---------|-------------|
| **users** | `id` (AUTO_INCREMENT) | `id` (INT), `name` (TEXT), `username` (TEXT, UNIQUE), `email` (TEXT, UNIQUE) | Core user account information |
| **avatars** | `id` (AUTO_INCREMENT) | `id` (INT), `user_id` (INT, FK→users.id), `location` (TEXT) | User profile pictures/avatars |
| **games** | `id` (AUTO_INCREMENT) | `id` (INT), `player1` (INT), `player2` (INT), `score1` (INT), `score2` (INT), `duration` (TEXT), `date` (TEXT) | Game records (DEPRECATED) |
| **user_games** | Composite (game_id, user_id) | `game_id` (INT, FK→games.id), `user_id` (INT, FK→users.id) | Junction table linking users to games |
| **friendships** | `id` (AUTO_INCREMENT) | `id` (INT), `user_from_id` (INT, FK→users.id), `user_to_id` (INT, FK→users.id), `status` (TEXT) | Friend requests and relationships with status (pending/accepted/rejected) |

**Key Relationships:**
```
users
  ├── 1:1 → avatars (one user can have one avatar)
  ├── 1:N → friendships (user can have many friendships)
  └── M:N → games (via user_games junction table)
```

#### 2. Authentication Service Database (`services/auth`)

Handles user authentication, sessions, and OAuth integration.

**Tables:**

| Table | Primary Key | Columns | Description |
|-------|-------------|---------|-------------|
| **auth_users** | `id` (AUTO_INCREMENT) | `id` (INT), `user_id` (INT, FK→user_service.users.id, UNIQUE), `user_name` (TEXT, UNIQUE), `email` (TEXT, UNIQUE), `passwd` (TEXT), `oauth_id` (INT, UNIQUE) | Authentication credentials with optional OAuth ID; requires either username or email |
| **sessions** | Composite (auth_id, user_id) | `auth_id` (INT, FK→auth_users.id), `user_id` (INT, FK→auth_users.user_id, UNIQUE), `token` (TEXT), `expires_in` (INT), `created_at` (INT) | Active user sessions with JWT tokens and expiration times |

**Key Relationships:**
```
auth_users
  └── 1:N → sessions (one user can have multiple active sessions)
```

**Constraints:**
- `auth_users`: At least one of `user_name` or `email` must be NOT NULL
- `oauth_id`: NULL for traditional signup, populated for OAuth authentication

#### 3. Game Stats Service Database (`services/game_stats`)

Tracks player statistics, rankings, and match history.

**Tables:**

| Table | Primary Key | Columns | Description |
|-------|-------------|---------|-------------|
| **user_stats** | `user_id` (INT) | `user_id` (INT, PK, FK→user_service.users.id), `wins` (INT, default=0), `losses` (INT, default=0), `streak` (INT, default=0), `total_points` (INT, default=0), `highest_score` (INT, default=0), `rank` (INT, default=0) | Aggregated player statistics and leaderboard rankings |
| **match_history** | `match_id` (AUTO_INCREMENT) | `match_id` (INT, PK), `timestamp` (INT), `player_one_id` (INT, FK→user_stats.user_id), `player_two_id` (INT, FK→user_stats.user_id), `winner_id` (INT, FK→user_stats.user_id), `p1_score` (INT), `p2_score` (INT), `match_duration` (INT, default=0) | Complete match records with player scores and timestamps |

**Key Relationships:**
```
user_stats
  └── 1:N → match_history (one player can have many matches)

match_history references three user_stats records:
  ├── player_one_id → user_stats
  ├── player_two_id → user_stats
  └── winner_id → user_stats
```

#### Database Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Service (SQLite)                        │
├─────────────────────────────────────────────────────────────────┤
│ users (id, name, username, email)                               │
│   ├─→ avatars (user_id FK, location)                            │
│   ├─→ friendships (user_from_id, user_to_id, status)           │
│   └─→ user_games (user_id FK, game_id FK)                       │
│         └─→ games (id, player1, player2, scores, duration)      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Auth Service (SQLite)                          │
├─────────────────────────────────────────────────────────────────┤
│ auth_users (id, user_id FK, user_name, email, passwd, oauth_id) │
│   └─→ sessions (auth_id FK, token, expires_in, created_at)      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  Game Stats Service (SQLite)                     │
├─────────────────────────────────────────────────────────────────┤
│ user_stats (user_id FK, wins, losses, streak, points, rank)     │
│   └─→ match_history (player_one_id, player_two_id, winner_id,   │
│                      scores, duration, timestamp)               │
└─────────────────────────────────────────────────────────────────┘
```

#### Data Type Reference

| Type | SQLite Implementation | Description |
|------|----------------------|-------------|
| `int()` | INTEGER | Whole numbers (primary keys, IDs, counts, scores) |
| `text()` | TEXT | Variable-length text strings (names, emails, tokens) |

#### Cross-Service References

While each service maintains its own database, foreign key relationships exist across services:
- **user_id**: Links across User Service, Auth Service, and Game Stats Service
- **oauth_id**: Links Auth Service to OAuth provider identities (e.g., GitHub)

#### Database Access Pattern

The application uses a custom ORM (`shared-server/orm`) that provides:
- Type-safe query building
- Automatic table creation from schema definitions
- Migration handling via `initDB()` functions
- Support for primary keys, foreign keys, unique constraints, and default values

#### Decision against Modules

| Category | Notes |
|--------|-------|
| Web | Blockchain too much of a hassle to learn (I think) |
| Gaming | Remote players works well with server-side Pong<br>Customization could be fairly easy, but maybe annoying as well<br>Live chat seems very complicated, but also very interesting<br>**NOTE:** Game might be best done by one person, except live chat maybe |
| DevOps | Other modules too much |


## Instructions

### Setup

First, you need to create an folder called "env" at the root of the repository. It must contain the following files (containing the following variables):

| filename   | variables |
|:-----------|:----------|
| .env.api | <ul><li>PORT</li><li>API_URL</li><li>USER_SERVICE_URL</li><li>AUTH_SERVICE_URL</li><li>GAME_STATS_SERVICE_URL</li><li>SERVER_PONG_URL</li></ul> |
| .env.auth | <ul><li>DB_FILE_PATH</li><li>USER_API_URL</li><li>GITHUB_APP_CLIENT_ID</li><li>GITHUB_APP_CLIENT_SECRET</li></ul> |
| .env.development | <ul><li>VITE_API_URL</li><li>USER_API_URL</li><li>GAME_STATS_SERVICE_URL</li><li>VITE_SERVER_GAME_WS_URL</li></ul> |
| .env.game | <ul><li>USER_URL</li></ul> |
| .env.game_stats | <ul><li>HOST</li><li>PORT</li></ul> |
| .env.user | <ul><li>DB_FILE_PATH</li><li>PORT</li><li>DATA_DIR</li><li>AVATAR_DIR</li></ul> |


### Installation
Then you need to install [nvm, node and npm](https://nodejs.org/en/download) for you OS.

Then in the root of the project, run

```sh
make install
```

This will install all the dependencies we added to the project, which are described in the package.json file.

npm is the Node.js Package Manager, and is the main utility to install and use javascript modules.

When adding a package with

```sh
npm add package-xzy
```

npm will modify the package.json and add the new dependency.

This means, that after you pull from the main branch after somebody merged a PR, you should rerun

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

will run [vite](https://vite.dev/guide/), which is a utility that bundles and translates our TypeScript files into JavaScript files and serves them. 

It will serves files at **http://localhost:8080** and will also start the backend services in dev mode.

For production builds, we will use

```sh
make prod
```

which will start the docker compose, and run frontend and backend services in separate containers

There is also a test feature
```sh
make test
```
which will need to be maintained/extendend as new services get added.


## Roles & Team Information
  
| **Person** | **Role**                                    | **Responsibilities**                        |
|:-----------|:--------------------------------------------|:--------------------------------------------|
| vvobis     | Product Owner / Technical Lead / Developer  | Decision on features and priorities, Validate completed work & Review critical code changes, Make technology stack decisions   |
| shaintha   | Scrum Master / Developer                    | Organization of team meetings, Ensure team communication  |
| khuk       | Developer                                   | Write code for assigned features, Testing  |
| pgober     | Developer                                   | Write code for assigned features, Testing, Documentation  |
| juitz      | Developer                                   | Write code for assigned features, Testing  |

## Project Management & Team Collaboration

We had regular meetings planned by shaintha as our Scrum Master. The whole communication was via Discord, where we also decided on meeting dates and schedules. During the meetings, we discussed task dstribution and assignments which will be due in the next meetings. 

We also used GitHub Issues for this, where we created tickets and assigned them to the respective team member(s). More information on who contributed what in the end can be found in sections "Roles & Team Information" as well as in the above Module table.

### Collaboration Agreement
Before a PR to main, a test should have been written for the change. A change does not have to be a full module, might be just a part of a module or feature.
Also, if a new module was started / submitted, it should have a corresponding service entry in the docker compose and docker file in the service directory.

Workflow:
- pull changes from main into current working branch after every commit/merge to main
- run ```make install``` to sync dependencies
- run ```make test``` to check if all tests work after commit to main
- run ```make prod``` to check the docker setup runs
- work & write tests for changes
- when ready for PR, first run ```make test``` to run old and new tests
- if all goes well, run ```make prod``` to see that all builds as expected
- push to the remote branch and create a PR with a description of the changes
- some other group member reviews the PR (can be requested with GitHub feature)
- the PR gets merged and the group is notified
- everybody pulls from main to sync new feature
- start from top


## Structure

Project structure:

```

ft_transcendence/
├── env                             # env files
│   └── ...
├── frontend                        # client / public code
│   ├── src
│   │   ├── lib                     # client modules
│   │   │   ├── api
│   │   │   ├── assets
│   │   │   ├── components
│   │   │   |   ├── custom
│   │   │   |   ├── error
│   │   │   |   ├── forms
│   │   │   |   ├── layout
│   │   │   |   └── ui
│   │   │   ├── game
│   │   │   ├── hooks
│   │   │   ├── tournament
│   │   │   ├── types 
│   │   │   ├── validation
│   │   │   └── vdom
│   │   └── routes
│   │       ├── auth
│   │       |   └── oauth-callback
│   │       ├── error
│   │       ├── friends
│   │       ├── game
│   │       ├── health
│   │       ├── pages
│   │       ├── profile
│   │       └── tournament
│   └── static
├── scripts                         # scripts for tests
├── services                        # server / private code
│   └── api                         # api service module with service-level docker file
│   │   ├── src
│   │   │   └── healthcheck
│   ├── auth
│   │   └── src
│   ├── database                    # database module
│   ├── game
│   │   └── src
│   ├── game_stats
│   │   ├── db
│   │   ├── src
│   │   └── tests
│   ├── nginx                       # webserver
│   ├── shared-server
│   │   ├── error
│   │   ├── jwt
│   │   └── orm
│   └── user
│       ├── src
│       └── tests
├── shared                          # interfaces used in client and server modules
│   ├── api
│   ├── game
│   ├── game_stats
│   └── user
├── docker-compose.yml              # compose starts the app in production mode
└── ...
```

#### Reasoning:

- simple
- separated client and server code
- services grouped in one dir, frontend separate
- shared types/interfaces between server and client modules


## Resources

#### Svelte
- https://svelte.dev/
- https://www.shadcn-svelte.com/

#### OAuth
- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow
- https://medium.com/@tony.infisical/guide-to-using-oauth-2-0-to-access-github-api-818383862591
- https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28
- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
