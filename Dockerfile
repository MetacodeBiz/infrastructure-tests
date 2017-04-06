FROM node:6.10-slim

WORKDIR /app/
COPY package.json /app/
RUN npm install
COPY . /app/
RUN npm run build && npm test

CMD ["npm", "start"]
