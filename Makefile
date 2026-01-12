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
	@npm run clean

test:
	@make test-frontend

test-backend:
	npm run test:backend

test-frontend:
	npm run dev:frontend:test

prod: up

up:
	@docker compose up --build

down:
	@docker compose down -v
