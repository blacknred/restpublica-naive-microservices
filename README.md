# RestPublica Microservices - Files Dashboard App on Docker


## Architecture

| Name             | Service | Container | Tech                        |
|------------------|---------|-----------|-----------------------------|
| Web              | Web     | web       | React, Redux, React-Router  |
| Posts API        | Posts   | posts     | Node, Express               |
| Posts DB         | Posts   | posts-db  | Postgres                    |
| Swagger          | Posts   | swagger   | Swagger UI                  |
| Users API        | Users   | users     | Node, Express               |
| Users DB         | Users   | users-db  | Postgres                    |
| Functional Tests | Test    | n/a       | TestCafe                    |


## Services

#### (1) Users API - http://localhost:3001

| Endpoint                        | HTTP Method | CRUD Method | Result                    |
|---------------------------------|-------------|-------------|---------------------------|
| /api/v1/users/status            | GET         | READ        | `ok`                      |
| /api/v1/users/register          | POST        | CREATE      | add a user                |
| /api/v1/users/login             | POST        | CREATE      | log in a user             |
| /api/v1/users/update            | PUT         | UPDATE      | update logged user info   |
| /api/v1/users/current           | GET         | READ        | get full logged user info |
| /api/v1/users/user/:username    | GET         | READ        | get free user info        |
| /api/v1/users/concise           | GET         | READ        | get users` names & avatars|
| /api/v1/users/subscriptions     | GET         | READ        | get a user` subscriptions |
| /api/v1/users/subscription/:id  | GET         | READ        | check a user` subscription|
| /api/v1/users/subscription      | POST        | CREATE      | create a new subscription |
| /api/v1/users/subscription/:id  | DELETE      | UPDATE      | delete subscription       |


## Run the project

### Setup

1. Fork/Clone this repo

1. Download [Docker](https://docs.docker.com/docker-for-mac/install/) (if necessary)

1. Make sure you are using a Docker version >= 17:

    ```sh
    $ docker -v
    Docker version 17.03.0-ce, build 60ccb22
    ```

### Build and Run the App

#### Set the Environment variables

```sh
$ export NODE_ENV=development
```

#### Fire up the Containers

Build the images:

```sh
$ docker-compose build
```

Run the containers:

```sh
$ docker-compose up -d
```

#### Migrate and Seed

With the apps up, run:

```sh
$ sh init_db.sh
```

#### Commands

To stop the containers:

```sh
$ docker-compose stop
```

To bring down the containers:

```sh
$ docker-compose down
```

Want to force a build?

```sh
$ docker-compose build --no-cache
```

Remove images:

```sh
$ docker rmi $(docker images -q)
```