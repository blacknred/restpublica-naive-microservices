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
| /api/v1/users/subscription/:id  | DELETE      | DELETE      | delete subscription       |

##### (2) Posts API - http://localhost:3002

| Endpoint                   | HTTP Method | CRUD Method | Result                    |
|----------------------------|-------------|-------------|---------------------------|
| /api/v1/posts/status       | GET         | READ        | `ok`                      |
| /api/v1/posts/dashboard    | GET         | READ        | get all dashboard posts   |
| /api/v1/posts/user/:id     | GET         | READ        | get all posts by user     |
| /api/v1/posts/search       | GET         | READ        | get posts by search       |
| /api/v1/posts/popular      | GET         | READ        | get all popular posts     |
| /api/v1/posts/             | POST        | CREATE      | add a single post to user |
| /api/v1/posts/:id          | GET         | READ        | get a single post         |
| /api/v1/posts/:id          | PUT         | UPDATE      | update a single post      |
| /api/v1/posts/:id          | DELETE      | DELETE      | delete a single post      |
| /api/v1/posts/:id/comments | GET         | READ        | get all post` comments    |
| /api/v1/posts/:id/comment  | POST        | CREATE      | create a post` comment    |
| /api/v1/posts/comments/:id | UPDATE      | UPDATE      | update a post` comment    |
| /api/v1/posts/comments/:id | DELETE      | DELETE      | delete a post` comment    |
| /api/v1/posts/:id/likes    | GET         | READ        | get all post` likes       |
| /api/v1/posts/:id/like     | POST        | CREATE      | create a post` like       |
| /api/v1/posts/like/:id     | DELETE      | DELETE      | delete a post` like       |


##### (3) Web (React client SPA) - http://localhost:3000

| Endpoint   | HTTP Method | CRUD Method | Result                            |
|------------|-------------|-------------|-----------------------------------|
| /          | GET         | READ        | render landing page               |
| /login     | GET         | READ        | login form on landing page        |
| /register  | GET         | READ        | register form on landing page     |
| /logout    | GET         | READ        | log a user out                    |
| /dashboard | GET         | READ        | render dashboard page             |
| /popular   | GET         | READ        | render popular posts page         |
| /search    | GET         | READ        | render search posts page          |
| /mine      | GET         | READ        | render user posts & stats page    |
| /u/:name   | GET         | READ        | render other user page            |
| /p/:id     | GET         | READ        | render post page                  |
| /profile   | GET         | READ        | render profile settings page      |
| /newpost   | GET         | READ        | render post creation or edit page |



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

#### Posts Database and Users Database

To access, get the container id from `docker ps` and then open `psql`:

```sh
$ docker exec -ti <container-id> psql -U postgres
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