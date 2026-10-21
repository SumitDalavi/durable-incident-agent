FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
COPY agent/package*.json ./agent/
COPY api/package*.json ./api/
COPY contracts/package*.json ./contracts/
COPY services/checkout/package*.json ./services/checkout/
COPY services/payments/package*.json ./services/payments/
COPY services/inventory/package*.json ./services/inventory/

RUN npm install

COPY . .

RUN npm run build --workspaces --if-present

EXPOSE 4000
CMD ["node", "api/index.js"]
