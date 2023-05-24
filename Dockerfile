FROM node:18 as base

WORKDIR /opt/app
EXPOSE 3000

FROM base as build

COPY package.json yarn.lock ./
COPY patches ./patches
COPY tools ./tools

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate
RUN yarn muse:build


FROM base as production

ENV NODE_ENV=production

COPY --from=BUILD /opt/app/dist/apps/muse /opt/app/dist/apps/muse
COPY --from=BUILD /opt/app/prisma /opt/app/prisma
COPY --from=BUILD /opt/app/node_modules /opt/app/node_modules
COPY --from=BUILD /opt/app/package.json /opt/app/package.json

COPY .docker/healthcheck.sh /healthcheck.sh
RUN chmod +x /healthcheck.sh
HEALTHCHECK --interval=30s --timeout=3s --start-period=1s CMD /healthcheck.sh

CMD ["yarn", "muse:start:prod"]
