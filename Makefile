.PHONY: prod dev frontend backend install clean api test test-backend test-frontend

FRONTEND := ./frontend

BACKEND := ./services
API_DIR := $(BACKEND)/api

dev:
	@npm run dev

frontend:
	@cd ${FRONTEND} && npm run dev

api:
	@cd ${API_DIR} && npm run dev

install:
	@npm install

clean:
	@rm -rf frontend/node_modules
	@rm -rf node_modules

test:
	@make test-frontend

test-backend:
	cd $(API_DIR) && npm run test

test-frontend:
	npm run dev:frontend:test

prod: up

up:
	@docker compose up --build

down:
	@docker compose down -v
