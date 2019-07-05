FROM node:10.9-slim@sha256:b269112ab0cd9dc8760ff406a07cf91f508257b3473031b414817e0c152c0744

WORKDIR /app/
COPY package.json package-lock.json /app/
RUN npm install
COPY . /app/
RUN npm run build

CMD ["npm", "test"]
