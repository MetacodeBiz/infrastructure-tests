FROM node:6.1-slim

WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .
RUN npm install && npm run build && npm test && npm prune --production

CMD ["npm", "start"]
