FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY server.ts server.ts
COPY tsconfig.json .

ENV NODE_ENV production

CMD ["bun", "server.ts"]

EXPOSE 3000