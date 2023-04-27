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
$ docker-compose up -d db lavalink
$ docker-compose up bot
```

### Running migrations

```bash
$ docker-compose exec -it bot yarn prisma migrate dev
```

---

### NodeJS

#### Prerequisite

-   [PostgresDB](https://www.postgresql.org/)
-   [Lavalink](https://github.com/freyacodes/Lavalink) ([Free hosted](https://lavalink.darrennathanael.com/NoSSL/lavalink-without-ssl/))

#### Installing

```bash
$ yarn
$ yarn prisma generate
$ yarn prisma migrate dev
```

### Running the app

```bash
# watch mode
$ yarn start:dev

# debug & watch mode
$ yarn start:debug

# production mode
$ yarn start:prod
```

---

## Stay in touch

-   Author - [Jurien Hamaker](https://jurien.dev)
-   Website - [https://the-river-styx.com](https://the-river-styx.com/)

## License

MUSE is [GPL licensed](LICENSE).
