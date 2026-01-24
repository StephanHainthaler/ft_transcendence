_This project has been created as part of the 42 curriculum by vvobis, shaintha, khuk, pgober, juitz._

## Description

This project is called ft_transcendence and is the final project of Coding School 42. 

Full-stack development but also team organization, project management and establishing of roles within the team are some of the key objectives of this project.

The goal of this project is to create a real-world web application as a team that can move in many directions, depending on the modules the team chooses.

### Pongopolis / Pongantic / Pongtastic (TBD!!!!!)
We decided on a web-application where you can play Pong. In the following subsection you can find the Modules and key features:

#### Modules, Features List, Technical Stack

| **Abbreviation**     | **Meaning**                  |
|:----------           |:------------------           |
|  ✅                 | Done                         |
|  🚧                 | In progress                  |
|  ❌                 | Cancelled                    |

| **Module**           | **Sub Module**            |**Technologies / Frameworks**| **Assignee**    | **Type**| **Points** | **Status** |  **Why we chose it**            |
| :---                 | :---                      |  :---              | :---            | :---    | :---       | :---       |   :---                    |
| **Web**              |                           |                    |                 |         |            |            |                           |
| `-`                  | Frontend Framework        | - Svelte<br> - Vite<br> - TypeScript<br> - Tailwind CSS<br> - shadcn/svelte | everyone        | Minor   | 1          | ✅        |  - Svelte is simple & fast<br> - Vite makes development quick with instant updates<br> - TypeScript catches bugs early<br> - Tailwind for styling<br> - shadcn/svelte provides pre-built components |
| `-`                  | Backend Framework         | - Fastify<br> - TypeScript<br> - Node.js | everyone        | Minor   | 1          | ✅        |  - Fastify is quick & good for building separate services<br> - TypeScript helps avoid mistakes with data types |
| `-`                  | ORM Database              | - Custom ORM<br> - SQLite via better-sqlite3 | vvobis          | Minor   | 1          | ✅        |  - Custom ORM keeps us in control & type-safe<br> - SQLite is simple to use & works everywhere |
| **Accessibility**    |                           |                    |                 |         |            |            |                           |
| `-`                  | Language Support          | - i18n library (TBD)<br> - shadcn/svelte localization support | khuk            | Minor   | 1          | ✅        |  - Multi-lingual team |
| `-`                  | Browser compatibility       | - cross-browser CSS | everyone        | Minor   | 1          | ✅        |  - Vite handles older browsers automatically<br> - Tailwind CSS works the same everywhere |
| **User Management**  |                           |                    |                 |         |            |            |                           |
| `-`                  | Standard user management  | - SQLite<br> - REST API (Fastify)<br> - TypeScript | vvobis          | Major   | 2          | ✅        |  - SQLite keeps data safe & consistent<br> - REST API is simple to use<br> - TypeScript prevents errors when handling user data |
| `-`                  | Game stats                | - SQLite (Game Stats Service)<br>- Leaderboard logic | khuk            | Minor   | 1          | ✅        |  - Separate database for stats so the user service doesn't get slowed down |
| `-`                  | Remote authentication     | - OAuth 2.0 (GitHub)<br> - JWT tokens<br> - bcrypt password hashing | pgober          | Minor   | 1          | ✅        |  - GitHub OAuth makes login easier for users<br> - JWT tokens work across all services<br> - bcrypt keeps passwords safe |
| `-`                  | JWT & 2FA               | - JWT (RS256 signing)<br> - 2FA<br>-Secure session storage | vvobis & juitz  | Minor   | 1          | ✅        |  - JWT lets services talk to each other without a shared database<br> - 2FA adds extra security when needed |
|**AI-Algorithm**      |                           |                    |                 |         |            |            |                           |
| `-`                  | AI Opponent               | - Mathematical Algorithm | pgober          | Major   | 2          | ✅        |  - Math-based AI is simple & fair<br> -  no need for complex ML |
| **Gaming**           |                           |                    |                 |         |            |            |                           |
| `-`                  | Web-based game            | - Canvas API<br> - WebSocket (real-time communication) | shaintha & juitz| Major   | 2          | ✅        |  - Canvas is the standard way to draw games in browsers<br> -  WebSocket keeps the game smooth for both players |
| `-`                  | Tournament system         | - SQLite storage<br>-REST API<br> - Real-time WebSocket updates | vvobis          | Minor   | 1          | ✅        |  - Automatic bracket generation handles any number of players<br> - WebSocket keeps everyone updated as the tournament progresses |
| **DevOps**           |                           |                    |                 |         |            |            |                           |
| `-`                  | Backend as microservices  | - Docker<br> - Docker Compose<br> - Nginx reverse proxy<br> - Fastify services | everyone        | Major   | 2          | ✅        |  - Microservices let each person work on their own part independently<br> - Docker makes sure it runs the same on everyone's computer<br> - Nginx puts everything together |
| **Modules of Choice**|                           |                    |                 |         |            |            |                           |
| `-`                  | Custom ORM                | - TypeScript generics<br> - SQLite bindings | vvobis          | Minor   | 1          | ✅        |  - Custom ORM gives us type safety without being complicated |
| **TOTAL**            |                           |                    |                 |         | _18_       |            |                           |


#### Decision against Modules

| Category | Notes |
|--------|-------|
| Web | - Blockchain too much of a hassle to learn (I think) |
| Gaming | - Remote players works well with server-side Pong<br> - Customization could be fairly easy, but maybe annoying as well<br> - Live chat seems very complicated, but also very interesting<br> - **NOTE:** Game might be best done by one person, except live chat maybe |
| DevOps | - Other modules too much |

### Architecture & Microservices

Our application follows a **microservices architecture** with the following components:

```
┌───────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Web Browser)                          │
│                     (Svelte + Vite + Canvas/WebSocket)                │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTP/HTTPS
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy / Load Balancer)               │
│                         Port: 80 / 443                                 │
└─┬──────────────┬──────────────┬──────────────┬──────────────┬──────────┘
  │              │              │              │              │
  │ HTTP/REST    │ HTTP/REST    │ HTTP/REST    │ HTTP/REST    │ WebSocket
  │              │              │              │              │
  ▼              ▼              ▼              ▼              ▼
┌──────────┐  ┌────────────┐ ┌──────────┐ ┌─────────────┐ ┌────────┐
│   API    │  │   AUTH     │ │  USER    │ │ GAME_STATS  │ │ GAME   │
│ Gateway  │  │  Service   │ │ Service  │ │  Service    │ │Service │
│(Fastify) │  │ (Fastify)  │ │(Fastify) │ │  (Fastify)  │ │(Fastify)
│          │  │            │ │          │ │             │ │        │
│ Routes:  │  │ Routes:    │ │ Routes:  │ │ Routes:     │ │ Routes:│
│ •/api/*  │  │ •/auth/*   │ │ •/user/* │ │ •/stats/*   │ │•/game/*│
│ •/login  │  │ •/oauth/*  │ │ •/profile│ │ •/rankings  │ │        │
│          │  │ •/logout   │ │ •/avatar │ │ •/history   │ │ Features:
│          │  │ •/2fa      │ │ •/friends│ │             │ │ • Game loop
└────┬─────┘  └─────┬──────┘ └────┬─────┘ └──────┬──────┘ │ • Real-time
     │              │             │              │        │   sync
     │              │             │              │        │ • Physics
     │              │             │              │        │
     └──────────────┼─────────────┼──────────────┼────────┘
                    │             │              │
                    ▼             ▼              ▼
            ┌──────────────┐ ┌──────────┐ ┌──────────────┐
            │ SQLite DB    │ │ SQLite   │ │ SQLite DB    │
            │ (auth.db)    │ │ DB (db)  │ │ (game_stats) │
            │              │ │          │ │              │
            │ •auth_users  │ │ •users   │ │ •user_stats  │
            │ •sessions    │ │ •games   │ │ •match_hist. │
            │              │ │ •friends │ │              │
            └──────────────┘ └──────────┘ └──────────────┘
```

**Key Points:**
- **Nginx** acts as a reverse proxy, routing requests to the appropriate microservice
- **API Gateway** orchestrates requests and coordinates between services
- **Auth Service** handles user authentication, OAuth 2.0, JWT tokens, and 2FA
- **User Service** manages user profiles, avatars, friendships, and game records
- **Game Service** manages real-time game logic, physics, and client synchronization via WebSocket
- **Game Stats Service** tracks statistics, rankings, and match history independently
- Each service has its own **SQLite database** for data isolation and independent scaling
- Services communicate via **REST APIs** (HTTP) and **WebSockets** for real-time features

### Database Schema

There are three separate SQLite databases managed by microservices:

#### 1. User Service Database (`services/user`)

Manages user accounts, profiles, avatars, games, and friend relationships.

**Tables:**

| Table | Primary Key | Columns | Description |
|-------|-------------|---------|-------------|
| **users** | `id` (AUTO_INCREMENT) | `id` (INT), `name` (TEXT), `username` (TEXT, UNIQUE), `email` (TEXT, UNIQUE) | User account information |
| **avatars** | `id` (AUTO_INCREMENT) | `id` (INT), `user_id` (INT), `location` (TEXT) | User avatars |
| **games** | `id` (AUTO_INCREMENT) | `id` (INT), `player1` (INT), `player2` (INT), `score1` (INT), `score2` (INT), `duration` (TEXT), `date` (TEXT) | Game records |
| **user_games** | Composite (game_id, user_id) | `game_id` (INT), `user_id` (INT) | Junction table linking users to games |
| **friendships** | `id` (AUTO_INCREMENT) | `id` (INT), `user_from_id` (INT), `user_to_id` (INT), `status` (TEXT) | Friend requests & relationships with status (pending/accepted/rejected) |

**Key Relationships:**
```
users
  ├── 1:1 → avatars (one user can have one avatar)
  ├── 1:N → friendships (user can have many friendships)
  └── M:N → games (via user_games junction table)
```

#### 2. Authentication Service Database (`services/auth`)

Handles user authentication, sessions and OAuth.

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

## Instructions

### Prerequisites

Before you can run this project, ensure you have the following installed on your system:

#### Required Software & Tools

| Software | Version | Purpose | Installation |
|----------|---------|---------|--------------|
| **Node.js** | >= 18.x | JavaScript runtime for backend and build tools | [nodejs.org](https://nodejs.org/en/download) |
| **npm** | >= 9.x | Node Package Manager | Included with Node.js |
| **nvm** (optional) | Latest | Node Version Manager for managing multiple Node versions | [nvm-sh/nvm](https://github.com/nvm-sh/nvm) |
| **Docker** | >= 20.x | Container runtime | [docker.com](https://www.docker.com/products/docker-desktop) |
| **Docker Compose** | >= 2.x | Containerization | [docker.com](https://docs.docker.com/compose/install/) |
| **Make** | >= 4.x | Build automation tool | Pre-installed on macOS/Linux; [GnuWin32](http://gnuwin32.sourceforge.net/packages/make.htm) for Windows |
| **Git** | >= 2.x | Version control | [git-scm.com](https://git-scm.com/) |

### Setup & Configuration

#### Step 1: Clone the Repository

```sh
git clone https://github.com/StephanHainthaler/ft_transcendence.git
cd ft_transcendence
```

#### Step 2: Create .env Files

Create a folder called `env` at the root of the repository:

```sh
mkdir env
```

Create the following .env files with the specified variables:
| Filename   | Description | Variables |
|:-----------| :---------- |:----------|
| .env.api | API Gateway service | <ul><li>PORT</li><li>API_URL</li><li>USER_SERVICE_URL</li><li>AUTH_SERVICE_URL</li><li>GAME_STATS_SERVICE_URL</li><li>SERVER_PONG_URL</li></ul> |
| .env.auth | Authentication | <ul><li>DB_FILE_PATH</li><li>USER_API_URL</li><li>GITHUB_APP_CLIENT_ID</li><li>GITHUB_APP_CLIENT_SECRET</li></ul> |
| .env.development | Frontend development | <ul><li>VITE_API_URL</li><li>USER_API_URL</li><li>GAME_STATS_SERVICE_URL</li><li>VITE_SERVER_GAME_WS_URL</li><li>VITE_GITHUB_CLIENT_ID</li></ul> |
| .env.game | Game | <ul><li>USER_URL</li></ul> |
| .env.game_stats | Game Stats | <ul><li>HOST</li><li>PORT</li></ul> |
| .env.user | User | <ul><li>DB_FILE_PATH</li><li>PORT</li><li>DATA_DIR</li><li>AVATAR_DIR</li></ul> |


#### Step 3: GitHub OAuth Configuration

For OAuth 2.0 authentication to work, follow the [instructions in the GitHub Docs](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).

### Installation

#### Step 4: Install Dependencies

Run the installation command at the root of the project:

```sh
make install
```

This command will:
- Install all npm dependencies listed in root `package.json`
- Install dependencies for all services (`services/*/package.json`)
- Install frontend dependencies (`frontend/package.json`)
- Install shared dependencies (`shared/package.json`)

**Note on npm:** npm is the Node Package Manager and the main utility for installing JavaScript modules. The `package.json` files specify which dependencies each service requires.

#### Step 5: Sync Dependencies After Pull

If you pull changes from `main` that include new dependencies:

```sh
make install
```

This ensures all new dependencies are installed locally.

#### Adding New Dependencies

To add a new package to a service:

```sh
cd services/<service-name>
npm install package-name
```

Or at the root for shared dependencies:

```sh
npm install package-name
```

### Running the Project

#### Development Mode

Start the development environment with automatic reloading:

```sh
make dev
```

or simply:

```sh
make
```

This will:
- Start **Vite** development server for the frontend at **http://localhost:8080**
- Hot Module Replacement (HMR) enabled for instant code updates
- Start all backend services in development mode with auto-restart on file changes
- Transpile TypeScript to JavaScript automatically
- Compile Tailwind CSS utilities dynamically

#### Production Mode

Build and run the application in Docker containers:

```sh
make prod
```

#### Testing

Run the full test suite:

```sh
make test
```

## Roles, Team Information & Individual Contributions
  
| **Person** | **Role**                                    | **Responsibilities**                        | **Individual Contributions** | **Challenges & Solutions** |
|:-----------|:--------------------------------------------|:--------------------|:----------------------------|:--------------------------------------------------|
| vvobis     | Product Owner / Technical Lead / Developer  | Decision on features and priorities, Validate completed work & Review critical code changes, Make technology stack decisions   | Custom ORM, User Service, Tournament System, JWT & 2FA | - ORM type safety<br> > TypeScript generics<br> - JWT cross-service auth<br> > RS256 asymmetric signing<br> - Tournament byes<br> > auto-advance unpaired players |
| shaintha   | Scrum Master / Developer                    | Organization of team meetings, Ensure team communication  | Pong Game mechanics, Canvas rendering, Game physics | - Game sync between clients<br> > server-authoritative loop<br> - Canvas performance<br> > optimized render pipeline |
| khuk       | Developer                                   | Write code for assigned features, Testing  | Game Stats Service, Leaderboard ranking, Language Support | - Stats isolation<br> > separate microservice |
| pgober     | Developer                                   | Write code for assigned features, Testing, Documentation  | OAuth 2.0 (GitHub), AI Opponent algorithm | - OAuth secrets exposure<br> > env variables<br> - AI fairness<br> > mathematical algorithm vs ML complexity |
| juitz      | Developer                                   | Write code for assigned features, Testing  | Web game (Canvas/WebSocket), 2FA | - 2FA implementation<br> > algorithm without external libs<br> - Real-time sync<br> > WebSocket frame throttling |

For more information on the individual contributions, you can also check the Modules table above.

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

## Resources

#### Svelte
- https://svelte.dev/
- https://www.shadcn-svelte.com/

#### OAuth
- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow
- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app
- https://medium.com/@tony.infisical/guide-to-using-oauth-2-0-to-access-github-api-818383862591
- https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28
- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps

#### AI Usage

**GitHub Copilot** for checking the understandability and completeness of the Readme documentation.
