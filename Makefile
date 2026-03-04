.PHONY: dev build preview lint format typecheck test install coverage \
        docker-build docker-run docker-prod-up docker-prod-down

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

lint:
	npm run lint

format:
	npm run format

typecheck:
	npm run typecheck

test:
	npm run test

install:
	npm install

coverage:
	npm run coverage

docker-build:
	docker build --target prod \
	  --build-arg VITE_API_URL=$(VITE_API_URL) \
	  --build-arg VITE_APP_NAME=$(VITE_APP_NAME) \
	  --build-arg VITE_APP_VERSION=$(VITE_APP_VERSION) \
	  -t admin-panel:latest .

docker-run:
	docker run --rm -p 3000:80 admin-panel:latest

docker-prod-up:
	docker compose -f docker-compose.prod.yml up -d --build

docker-prod-down:
	docker compose -f docker-compose.prod.yml down
