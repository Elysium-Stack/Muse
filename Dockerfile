FROM node:20-alpine as base

WORKDIR /opt/app
EXPOSE 3000

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64
RUN chmod +x /usr/local/bin/dumb-init

RUN apk add --no-cache openssl

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
