# Berlin IoT Hub API

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Berlin IoT Hub API](#berlin-iot-hub-api)
  - [Berlin IoT Hub Technology Stack](#berlin-iot-hub-technology-stack)
  - [Development](#development)
    - [Environment Variables](#environment-variables)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
    - [Work on it](#work-on-it)
  - [Test](#test)
  - [Deploy](#deploy)
  - [API Interaction + Documentation](#api-interaction--documentation)
  - [Docs](#docs)

<!-- /code_chunk_output -->

## Berlin IoT Hub Technology Stack

The Berlin IoT Hub consists of two components, namely: an RESTful API and a frontend. All of these components are administrated within their very own Repository stored in

- [github.com/technologiestiftung/berlin-datahub-api](https://github.com/technologiestiftung/berlin-datahub-api)
- [github.com/technologiestiftung/berlin-iot-hub-frontend](https://github.com/technologiestiftung/berlin-iot-hub-frontend)


![Technology Stack](images/berlin-IoT-hub-diagram.png)

## Development

The API is written in Typescript and uses Express.js + and Prisma. 

### Environment Variables

You can find an example `.env` file under [./prisma/env.example](./prisma/env.example). Make sure to obtain an [LogDNA Key](https://logdna.com/) to connect to your account. (You can get this by going to the addon section on render.com). 

### Prerequisites

- Node.js >= 12
- Docker >= 19
  
### Setup

```bash

docker-compose up
npm ci
```

### Work on it

```bash
# Assumes you habe a posstgres DB running
npm run dev
```


## Test

Uses Jest. Prisma creates for each test run a sqlite DB. Currently this is fine. We might need to switch to a Postgres setup later on.

```bash
npm t
```


## Deploy

The API is deployed to [render.com](https://render.com). You can find all definition in [render.yaml](render.yaml). Deploy via Infrastructure as Code. Don't forget to add your environment variables.

## API Interaction + Documentation


This api provides some endpoints for posting data over HTTP. You need an user account to do that. You can find many examples in the file [http-requests/api.http](http-requests/api.http). This file can be used with the [VSCode Rest Client Extension](https://github.com/Huachao/vscode-restclient). Make sure to create your `.env` file there from the provided example under [./http-requests/env.example](./http-requests/env.example).




## Docs

Docs are generated using [typedoc](http://typedoc.org/) and deployed to [github pages](https://technologiestiftung.github.io/berlin-datahub-api/).  
