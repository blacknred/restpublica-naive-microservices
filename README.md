# Restpublica Social Media App - Microservices on Docker


## Architecture

| Name            | Microservice  | Container             | Stack            | Ports |
|-----------------|---------------|-----------------------|------------------|-------|
| Web Client      | -             | web-client            | React, Redux     | 3000  |
| Mobile Client   | -             | mobile-client         | React, Redux     | 3001  |
| API Gateway     | -             | api-gateway           | Node, Koa        | 3003  |
| Redis Cache     | -             | redis-cache           | Node, Redis      | 6379  |
| Users API       | Users         | users-service         | Node, Express    | 3004  |
| Users DB        | Users         | users-db              | Postgres         | 5433  |
| Communities API | Communities   | communities-service   | Node, Express    | 3005  |
| Communities DB  | Communities   | communities-db        | Postgres         | 5434  |
| Posts API       | Posts         | posts-service         | Node, Express    | 3006  |
| Posts DB        | Posts         | posts-db              | Postgres         | 5435  |
| Mock Storage    | Posts         | files-storage         | Node, Koa        | 3007  |
| Swagger         | Posts         | swagger               | Node, Swagger UI | 3009  |
| Partners API    | Partners      | partners-service      | Node, Express    | 3008  |
| Partners DB     | Partners      | partners-db           | Mongo            | 27017 |
<!-- | Notifications   | Notifications | notifications-service |                  | 3010  | -->

#### API Gateway - http://localhost:3003

Limit, Filter, Secure
Entry point API for microservices:
* Cluster support to spawn multiple processes
* Logging
* Js cron
* Microservices registry mock
* Consumers (users||apps) registry
* Circuit breaker and fallbacks

#### Mock Storage - http://localhost:3007

Mock storage with API for CREATE, DELETE and GET static posts files

#### Redis Cache

Cache layer for rate/limit API policy and service registry

#### Swagger - http://localhost:3009/docs

Posts API documentation at the above URL

#### Users, Communities, Posts and Partners Databases

To access, get the container id from `docker ps` and then open `psql`:

```sh
$ docker exec -ti <container-id> psql -U postgres
```


## Services

#### (1) Users API - http://localhost:3004/v1

| Endpoint                     | HTTP Method | CRUD Method | Result                      |
|------------------------------|-------------|-------------|-----------------------------|
| /ping                        | GET         | READ        | `pong`                      |
| /users                       | POST        | CREATE      | add an user                 |
| /users/login                 | POST        | CREATE      | log in an user              |
| /users/check                 | GET         | READ        | check an user id            |a
| /users/profile               | GET         | READ        | get logged user data        |a
| /users                       | PUT         | UPDATE      | update an user value        |a
| /users                       | DELETE      | DELETE      | delete an inactive users    | c
| /users                       | GET         | READ        | get all trending profiles   | c
| /users?query=query           | GET         | READ        | get all profiles by search  | c
| /users?list=uids             | GET         | READ        | get all profiles by ids     | c
| /users/:name?lim=id          | GET         | READ        | get a profile(id)           | c
| /users/:uid/follow           | POST        | CREATE      | create a subscription       |a
| /users/:uid/followers        | GET         | READ        | get a profile followers     |a
| /users/:uid/following        | GET         | READ        | get a profile following(id) |a
| /users/:uid/following?lim=id | GET         | READ        | get a user following ids    |a
| /users/:uid/follow/:sid      | DELETE      | DELETE      | delete a subscription       |a

#### (2) Communities API - http://localhost:3005/v1

| Endpoint                           | HTTP Method | CRUD Method | Result                     |
|------------------------------------|-------------|-------------|----------------------------|
| /ping                              | GET         | READ        | `pong`                     |
| /communities                       | POST        | CREATE      | add a com-ty               |a
| /communities                       | GET         | READ        | get all trending com-s     | ?c
| /communities?query=query           | GET         | READ        | get all com-s by search    | ?c
| /communities?list=cids&lim=name    | GET         | READ        | get all com-s by ids       | ?c
| /communities?profile=pid&lim=id    | GET         | READ        | get all com-s(id) by user  | ?c
| /communities?profile=pid&lim=count | GET         | READ        | get all com-s(cnt) by user | ?c
| /communities?admin=aid             | GET         | READ        | get all com-s by admin     |a
| /communities/:name?lim=id          | GET         | READ        | get a com-ty(id)           | c
| /communities/:cid                  | PUT         | UPDATE      | update a com-ty            |a 
| /communities/:cid                  | DELETE      | DELETE      | delete a com-ty            |a
| /communities/:cid/follow           | POST        | CREATE      | create a subscription      |a
| /communities/:cid/followers        | GET         | READ        | get a com-ty followers     |ac
| /communities/:cid/follow           | DELETE      | DELETE      | delete a subscription      |a
| /communities/:cid/ban              | POST        | CREATE      | create a ban               |a
| /communities/:cid/bans             | GET         | READ        | get all bans               |ac

#### (3) Posts API - http://localhost:3006/v1/

| Endpoint                           | HTTP Method | CRUD Method | Result                      |
|------------------------------- ----|-------------|-------------|-----------------------------|
| /posts                             | POST        | CREATE      | add a post                  |ac
| /posts                             | GET         | READ        | get all trending posts      | c
| /posts?tag=tag                     | GET         | READ        | get all posts by tag        | c
| /posts?query=query                 | GET         | READ        | get all posts by search     | c
| /posts?profiles=pids&lim=count     | GET         | READ        | get all posts(id) by user   | c
| /posts?communities=cids&?lim=count | GET         | READ        | get all community posts(id) | c
| /posts/:slug                       | GET         | READ        | get a post                  | c
| /posts/:pid                        | PUT         | UPDATE      | update a post               |a
| /posts/:pid                        | DELETE      | DELETE      | delete a post               |a
| /posts/:pid/comments               | POST        | CREATE      | create a comment            |a
| /posts/:pid/comments               | GET         | READ        | get all comments            | c
| /posts/:pid/comments/:cid          | PUT         | UPDATE      | update a comment            |a
| /posts/:pid/comments/:cid          | DELETE      | DELETE      | delete a comment            |a
| /posts/:pid/likes                  | POST        | CREATE      | create a like               |a
| /posts/:pid/likes                  | GET         | READ        | get all likes               |ac
| /posts/:pid/likes/:lid             | DELETE      | DELETE      | delete a like               |a
| /tags                              | GET         | READ        | get all trending tags       |
| /tags?query=query                  | GET         | READ        | get all tags by search      |

#### (4) Partners API - http://localhost:3008/v1/

| Endpoint       | HTTP Method | CRUD Method | Result        |
|----------------|-------------|-------------|---------------|
| /ping          | GET         | READ        | `pong`        |a
| /plans         | POST        | CREATE      | add a plan    |a
| /plans         | GET         | READ        | get all plans |a
| /plans/:pid    | GET         | READ        | get a plan    | 
| /plans/:pid    | PUT         | UPDATE      | update a plan |a
| /plans/:pid    | DELETE      | DELETE      | delete a plan |a
| /apps          | POST        | CREATE      | add an app    |a
| /apps/check    | POST        | CREATE      | check an app  |a
| /apps          | GET         | READ        | get all apps  |a
| /apps/:pid     | GET         | READ        | get an app    |
| /apps/:pid     | PUT         | UPDATE      | update an app |a
| /apps/:pid     | DELETE      | DELETE      | delete an app |a

<!-- #### (5) Notifications - http://localhost:3010 -->


## Clients

#### (1) Web Client (React-Router) - http://localhost:3000

| Endpoint     | Result                            |
|--------------|-----------------------------------|
| /            | render dashboard or landing page  |
| /login       | login form on landing page        |
| /register    | register form on landing page     |
| /logout      | log a user out to landing pag     |
| /trending    | render popular content            |
| /search      | render searched content           |
| /communities | render user communities           |
| /activity    | render user related activity      |
| /p/:id       | render post                       |
| /settings    | render settings                   |
| /post        | render new post or edit post page |
| /:username   | render user data and posts        |


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
or run for each service:

```sh
$ npm migrate && npm seed
```
or

```sh
$ docker-compose run users-service npm seed
```

#### Databases

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