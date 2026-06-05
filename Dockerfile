FROM node:26-alpine

RUN apk add --no-cache openssh-keygen
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

COPY tsconfig.json ./
COPY src ./src

CMD ["pnpm", "start"]
