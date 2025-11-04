.PHONY: dev frontend backend install clean

dev:
	@make -j2 frontend backend

frontend:
	@cd frontend && npm run dev

backend:
	@cd backend && npm run dev

install:
	@cd frontend && npm install
	@cd backend && npm install

clean:
	@rm -rf frontend/node_modules frontend/dist
	@rm -rf backend/node_modules backend/dist

prod:
	@docker compose up --build

down:
	@docker compose down -v
