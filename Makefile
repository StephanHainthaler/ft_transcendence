.PHONY: prod dev frontend backend install clean fclean api test test-backend test-frontend

FRONTEND := ./frontend

BACKEND := ./services
API_DIR := $(BACKEND)/api

dev: install
	@npm run dev

frontend:
	@cd ${FRONTEND} && npm run dev

api:
	@cd ${API_DIR} && npm run dev

install: package.json
	@npm install

clean:
	@npm run clean

fclean: clean
	@npm run clean:db
	@docker compose down -v

test:
	npm run test:backend

test-frontend:
	npm run dev:frontend:test

prod: up

up:
	@docker compose up --build -d

down:
	@docker compose down -v
