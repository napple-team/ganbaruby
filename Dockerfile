FROM node:14 AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:14

WORKDIR /usr/src/app

COPY package.json package-lock.json tsconfig.json ./

RUN npm install --production \
  && mkdir -p ./temp

COPY --from=builder /usr/src/app/dist/ ./dist/
COPY docker-entrypoint.sh docker-entrypoint.sh

ENTRYPOINT [ "/usr/src/app/docker-entrypoint.sh" ]
