FROM node:9.8-slim@sha256:82a4bb34b76e6a5d2b8db6637c6eb2a0e488a52cd11dc7eff5ba576c6d6817f2

WORKDIR /app/
COPY package.json yarn.lock /app/
RUN yarn
COPY . /app/
RUN npm run build

CMD ["npm", "test"]
