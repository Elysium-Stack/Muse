FROM node:18 as base

WORKDIR /opt/app
EXPOSE 3000


FROM base as build

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate
RUN yarn build


FROM base as production

ENV NODE_ENV=production

COPY --from=BUILD /opt/app/dist /opt/app/dist
COPY --from=BUILD /opt/app/node_modules /opt/app/node_modules
COPY --from=BUILD /opt/app/package.json /opt/app/package.json

CMD ["yarn", "start:prod"]
