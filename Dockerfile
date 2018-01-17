FROM node:9.4-slim@sha256:41812a18ec7c647e85a3d8faba9ce1a213f35945321a5f6b4aef0283ec6ed740

WORKDIR /app/
COPY package.json npm-shrinkwrap.json /app/
RUN npm install
COPY . /app/
RUN npm run build

CMD ["npm", "test"]
