FROM node:13.7@sha256:944f469fc0eb34391766f9598d094a38f3fd629791c43972abfa2ce3b1b587f6

WORKDIR /app/
COPY package.json package-lock.json /app/
RUN npm install
COPY . /app/
RUN npm run build

CMD ["npm", "test"]
