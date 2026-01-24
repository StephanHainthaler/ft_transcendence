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

| **Module**           | **Sub Module**            |**Technologies / Frameworks**| **Assignee**    | **Type**| **Points** | **Status** |  **Why we chose it**            |
| :---                 | :---                      |  :---              | :---            | :---    | :---       | :---       |   :---                    |
| **Web**              |                           |                    |                 |         |            |            |                           |
| `-`                  | Frontend Framework        | Svelte, Vite, TypeScript, Tailwind CSS, shadcn/svelte | everyone        | Minor   | 1          | ✅        | Svelte is simple and fast; Vite makes development quick with instant updates; TypeScript catches bugs early; Tailwind makes styling easy; shadcn/svelte gives us ready-made components |
| `-`                  | Backend Framework         | Fastify, TypeScript, Node.js | everyone        | Minor   | 1          | ✅        | Fastify is quick and lightweight; good for building separate services; TypeScript helps us avoid mistakes with data types |
| `-`                  | ORM Database              | Custom ORM (type-safe query builder), SQLite via better-sqlite3 | vvobis          | Minor   | 1          | ✅        | Custom ORM keeps us in control and type-safe; SQLite is simple to use and works everywhere; easier than complex database systems |
| **Accessibility**    |                           |                    |                 |         |            |            |                           |
| `-`                  | Language Support          | i18n library (TBD), shadcn/svelte localization support | khuk            | Minor   | 1          | ✅        | Our team speaks different languages, so multi-language support makes sense; the component library already has translation support |
| `-`                  | Browser compatibility       | ES2020+ target, Vite polyfills, cross-browser CSS | everyone        | Minor   | 1          | ✅        | Vite handles older browsers automatically; Tailwind CSS works the same everywhere; components are tested on modern browsers |
| **User Management**  |                           |                    |                 |         |            |            |                           |
| `-`                  | Standard user management  | SQLite (User Service), REST API (Fastify), TypeScript | vvobis          | Major   | 2          | ✅        | SQLite keeps data safe and consistent; REST API is simple to use; TypeScript prevents errors when handling user data |
| `-`                  | Game stats                | SQLite (Game Stats Service), Query aggregation, Leaderboard logic | khuk            | Minor   | 1          | ✅        | Separate database for stats so the user service doesn't get slowed down; uses a ranking system (like chess ELO); can update stats without affecting other parts |
| `-`                  | Remote authentication     | OAuth 2.0 (GitHub), JWT tokens, bcrypt password hashing | pgober          | Minor   | 1          | ✅        | GitHub OAuth makes login easier for users and less code for us; JWT tokens work across all services; bcrypt keeps passwords safe |
| `-`                  | JWT and 2FA               | JWT (RS256 signing), 2FA (TOTP, optional), Secure session storage | vvobis & juitz  | Minor   | 1          | ✅        | JWT lets services talk to each other without a shared database; 2FA adds extra security when needed |
|**AI-Algorithm**      |                           |                    |                 |         |            |            |                           |
| `-`                  | AI Opponent               | Mathematical Algorithm (ball physics prediction, paddle positioning), WebSocket real-time updates | pgober          | Major   | 2          | ✅        | Math-based AI is simple and fair; no need for complex machine learning; WebSocket makes the game feel instant |
| **Gaming**           |                           |                    |                 |         |            |            |                           |
| `-`                  | Web-based game            | Canvas API, WebSocket (real-time communication), Game Loop (server-authoritative), Pong physics engine | shaintha & juitz| Major   | 2          | ✅        | Canvas is the standard way to draw games in browsers; WebSocket keeps the game smooth for both players; server handles the game logic so nobody can cheat; custom physics just for Pong keeps it simple |
| `-`                  | Tournament system         | Bracket generation algorithm, SQLite storage, REST API, Real-time WebSocket updates | vvobis          | Minor   | 1          | ✅        | Automatic bracket generation handles any number of players; WebSocket keeps everyone updated as the tournament progresses |
| **DevOps**           |                           |                    |                 |         |            |            |                           |
| `-`                  | Backend as microservices  | Docker, Docker Compose, Nginx reverse proxy, Fastify services | everyone        | Major   | 2          | ✅        | Microservices let each person work on their own part without getting in the way; Docker makes sure it runs the same on everyone's computer; Nginx puts everything together |
| **Modules of Choice**|                           |                    |                 |         |            |            |                           |
| `-`                  | Custom ORM                | TypeScript generics, Query builder pattern, SQLite bindings | vvobis          | Minor   | 1          | ✅        | Custom ORM gives us type safety without being complicated; easier to understand than big frameworks; good learning experience for school |
| **TOTAL**            |                           |                    |                 |         | _18_       |            |                           |


#### Decision against Modules

| Category | Notes |
|--------|-------|
| Web | Blockchain too much of a hassle to learn (I think) |
| Gaming | Remote players works well with server-side Pong<br>Customization could be fairly easy, but maybe annoying as well<br>Live chat seems very complicated, but also very interesting<br>**NOTE:** Game might be best done by one person, except live chat maybe |
| DevOps | Other modules too much |

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

## Instructions

### Prerequisites

Before you can run this project, ensure you have the following installed on your system:

#### Required Software & Tools

| Software | Version | Purpose | Installation |
|----------|---------|---------|--------------|
| **Node.js** | >= 18.x | JavaScript runtime for backend and build tools | [nodejs.org](https://nodejs.org/en/download) |
| **npm** | >= 9.x | Node Package Manager (comes with Node.js) | Included with Node.js |
| **nvm** (optional) | Latest | Node Version Manager for managing multiple Node versions | [nvm-sh/nvm](https://github.com/nvm-sh/nvm) |
| **Docker** | >= 20.x | Container runtime for production builds | [docker.com](https://www.docker.com/products/docker-desktop) |
| **Docker Compose** | >= 2.x | Container orchestration (usually bundled with Docker Desktop) | [docker.com](https://docs.docker.com/compose/install/) |
| **Make** | >= 4.x | Build automation tool | Pre-installed on macOS/Linux; [GnuWin32](http://gnuwin32.sourceforge.net/packages/make.htm) for Windows |
| **Git** | >= 2.x | Version control | [git-scm.com](https://git-scm.com/) |

#### System Requirements

- **OS:** macOS, Linux, or Windows (with WSL2 for optimal Docker support)
- **RAM:** Minimum 4GB (8GB+ recommended for Docker containers)
- **Disk Space:** Minimum 2GB for dependencies and databases
- **Network:** Internet connection for npm package downloads and OAuth

#### Optional Tools

- **VS Code** with extensions: Svelte, TypeScript, ESLint, Prettier
- **Postman** or **Insomnia**: API testing tools for backend endpoints
- **SQLite Browser**: For inspecting SQLite databases during development

### Setup & Configuration

#### Step 1: Clone the Repository

```sh
git clone https://github.com/StephanHainthaler/ft_transcendence.git
cd ft_transcendence
```

#### Step 2: Create Environment Files

Create a folder called `env` at the root of the repository:

```sh
mkdir env
```

Create the following environment files with the specified variables:

**`env/.env.development`** (Frontend development)
```
VITE_API_URL=http://localhost:3000/api
USER_API_URL=http://localhost:3001
GAME_STATS_SERVICE_URL=http://localhost:3004
VITE_SERVER_GAME_WS_URL=ws://localhost:3003
```

**`env/.env.api`** (API Gateway service)
```
PORT=3000
API_URL=http://localhost:3000
USER_SERVICE_URL=http://localhost:3001
AUTH_SERVICE_URL=http://localhost:3002
GAME_STATS_SERVICE_URL=http://localhost:3004
SERVER_PONG_URL=http://localhost:3003
```

**`env/.env.auth`** (Authentication service)
```
PORT=3002
DB_FILE_PATH=/app/db/auth.db
USER_API_URL=http://user:3001
GITHUB_APP_CLIENT_ID=<your_github_oauth_client_id>
GITHUB_APP_CLIENT_SECRET=<your_github_oauth_client_secret>
```

**`env/.env.user`** (User service)
```
PORT=3001
DB_FILE_PATH=/app/db/user.db
DATA_DIR=/app/data
AVATAR_DIR=/app/data/avatars
```

**`env/.env.game`** (Game service)
```
PORT=3003
USER_URL=http://user:3001
```

**`env/.env.game_stats`** (Game Stats service)
```
PORT=3004
DB_FILE_PATH=/app/db/stats.db
```

**`env/.env.prod`** (Production overrides, optional)
```
NODE_ENV=production
VITE_API_URL=https://yourdomain.com/api
VITE_SERVER_GAME_WS_URL=wss://yourdomain.com
```

#### Step 3: GitHub OAuth Configuration (Optional)

For OAuth 2.0 authentication to work:

1. Go to [GitHub OAuth Applications](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** ft_transcendence
   - **Homepage URL:** `http://localhost:8080` (development) or your production URL
   - **Authorization callback URL:** `http://localhost:8080/auth/oauth-callback`
4. Copy the `Client ID` and `Client Secret` into `env/.env.auth`

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

Start the development environment with automatic hot-reloading:

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

**Access the application:**
- Frontend: http://localhost:8080
- API Gateway: http://localhost:3000/api
- User Service: http://localhost:3001
- Auth Service: http://localhost:3002
- Game Service: http://localhost:3003
- Game Stats Service: http://localhost:3004

#### Production Mode

Build and run the application in Docker containers:

```sh
make prod
```

This will:
- Use Docker Compose to orchestrate all services
- Build Docker images for each microservice
- Run frontend in Nginx reverse proxy
- Run all backend services in isolated containers
- Use production environment variables from `.env` files
- Enable networking between containers

**Access the application:**
- Frontend: http://localhost (via Nginx)
- All API routes proxied through Nginx

#### Testing

Run the full test suite:

```sh
make test
```

This will:
- Execute all test files in `services/*/tests/`
- Run TypeScript checks
- Validate type safety across the codebase
- Generate test reports

To run tests for a specific service:

```sh
cd services/<service-name>
npm test
```

### Troubleshooting Common Issues

#### Port Already in Use

If a port is already in use, either:
1. Stop the process using that port, or
2. Modify the `PORT` variable in the corresponding `.env` file

#### Node Version Mismatch

Use nvm to install the correct Node version:

```sh
nvm install 18
nvm use 18
```

#### Docker Issues (Production Mode)

Ensure Docker daemon is running:

```sh
# macOS
open /Applications/Docker.app

# Linux
sudo systemctl start docker

# Windows
# Start Docker Desktop from Start Menu
```

#### Dependencies Not Found

Clear npm cache and reinstall:

```sh
npm cache clean --force
make install
```

#### Database Initialization Errors

Databases are automatically initialized on first run. If you encounter issues, delete the database files:

```sh
rm -rf services/*/db/*.db
```

Then restart the application to recreate the databases.


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
