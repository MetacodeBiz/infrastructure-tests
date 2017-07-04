FROM node:8.1-slim

WORKDIR /app/
COPY package.json npm-shrinkwrap.json /app/
RUN npm install
COPY . /app/
RUN npm run build && npm test

CMD ["npm", "start"]
