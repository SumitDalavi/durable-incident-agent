.PHONY: setup dev test e2e clean lint

setup:
	npm install

dev:
	docker compose up -d
	npm run build
	@echo "Starting services and api..."
	npm run start --workspace=services/checkout & \
	npm run start --workspace=services/payments & \
	npm run start --workspace=services/inventory & \
	npm run start --workspace=api & \
	npm run start --workspace=agent

test:
	npm run test

clean:
	docker compose down -v
	npm run clean
