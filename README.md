<p align="center">
  <a href="http://the-river-styx.com/" target="blank"><img src="https://raw.githubusercontent.com/Elysium-Stack/Muse/master/.github/logo.png" width="200" alt="Muse logo" /></a>
</p>

  <p align="center">A multi-purpose <a href="http://discord.com" target="_blank">Discord</a> bot for the <a href="http://the-river-styx.com" target="_blank">Elysium</a> server.</p>
    <p align="center">
      <img src="https://img.shields.io/github/license/elysium-stack/muse" alt="Package License" />
      <img src="https://img.shields.io/github/actions/workflow/status/elysium-stack/muse/deploy.yml" alt="CircleCI" />
      <a href="https://discord.the-river-styx.com" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
    </p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Running Muse

### Getting started

```bash
$ git clone git@github.com:Elysium-Stack/Muse.git
```

**Copy the `.env.example` to `.env` and change the values in the `.env file`**

---

### Docker (Recommended)

#### Prerequisite

-   [Docker](https://www.docker.com/)

### Running the app

```bash
$ docker-compose up -d db rabbitmq lavalink
$ docker-compose up muse
```

### Running the music services

```bash
$ docker-compose up radio music
```

### Running migrations

```bash
$ docker-compose exec -it muse yarn prisma migrate dev
```

---

### NodeJS

#### Prerequisite

-   [NodeJS 18.x](https://nodejs.org/en/download)
-   [PostgresDB](https://www.postgresql.org/)
-   [RabbitMQ](https://www.rabbitmq.com/)
-   [Lavalink](https://github.com/freyacodes/Lavalink) ([Free hosted](https://lavalink.darrennathanael.com/NoSSL/lavalink-without-ssl/))

#### Installing

```bash
$ yarn
$ yarn prisma generate
$ yarn prisma migrate dev
```

### Running the bot/api

```bash
# watch mode (recommended)
$ yarn muse:start

# production mode
$ yarn muse:start:prod
```

### Running the music/radio

```bash
# watch mode (recommended)
$ yarn music:start
$ yarn radio:start

# production mode
$ yarn music:start:prod
$ yarn radio:start:prod
```

---

## Stay in touch

-   Author - [Jurien Hamaker](https://jurien.dev)
-   Website - [https://the-river-styx.com](https://the-river-styx.com/)

## License

MUSE is [GPL licensed](LICENSE).
