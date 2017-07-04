FROM node:8.1-slim@sha256:170958638ebdd26233b795b734e5c2a2a66ed23edab77e094aa9cf97e269cc3d

WORKDIR /app/
COPY package.json npm-shrinkwrap.json /app/
RUN npm install
COPY . /app/
RUN npm run build && npm test

CMD ["npm", "start"]
