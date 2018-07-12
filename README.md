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
* Circuit breaker

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

| Endpoint                | HTTP Method | CRUD Method | Result                       |
|-------------------------|-------------|-------------|------------------------------|
| /ping                   | GET         | READ        | `pong`                       |
| /users                  | POST        | CREATE      | add an user                  |
| /users/login            | POST        | CREATE      | log in an user               |
| /users/check            | GET         | READ        | check an user id             |ai
| /users/profile          | GET         | READ        | get logged user data         |a
| /users                  | PUT         | UPDATE      | update an user value         |a
| /users                  | DELETE      | DELETE      | delete the inactive users    | i
| /users                  | GET         | READ        | get all trending profiles    | 
| /users?q=query          | GET         | READ        | get all profiles by query    | 
| /users?list=uids&lim=   | GET         | READ        | get limited data of profiles | i
| /users/:name            | GET         | READ        | get the profile              | 
| /users/:uid/follow      | POST        | CREATE      | create a subscription        |a
| /users/:uid/followers   | GET         | READ        | get a profile followers      |a
| /users/:uid/following   | GET         | READ        | get a profile following      |a
| /users/:uid/feed        | GET         | READ        | get a profile following ids  |a
| /users/:uid/follow/:sid | DELETE      | DELETE      | delete the subscription      |a

#### (2) Communities API - http://localhost:3005/v1

| Endpoint                       | HTTP Method | CRUD Method | Result                    |
|--------------------------------|-------------|-------------|---------------------------|
| /ping                          | GET         | READ        | `pong`                    |
| /communities                   | POST        | CREATE      | add a com-ty              |a
| /communities                   | GET         | READ        | get all trending com-s    |
| /communities?q=query           | GET         | READ        | get all com-s by query    | 
| /communities?admin=aid&mode=   | GET         | READ        | get all com-s by admin    |a
| /communities?profile=pid&mode= | GET         | READ        | get all com-s by profile  |
| /communities?list=cids&lim=    | GET         | READ        | get limited com-s's data  | i
| /communities/:name             | GET         | READ        | get the com-ty            | 
| /communities/:cid              | PUT         | UPDATE      | update the com-ty         |a 
| /communities                   | DELETE      | DELETE      | delete the com-ty         |ai
| /communities/:cid/follow       | POST        | CREATE      | create a subscription     |a
| /communities/:cid/participants | GET         | READ        | get the com-ty followers  |a
| /communities/:cid/moderators   | GET         | READ        | get the com-ty moderators |a
| /communities/:cid/follow/sid   | DELETE      | DELETE      | delete the subscription   |a
| /communities/:cid/ban          | POST        | CREATE      | create a ban              |a
| /communities/:cid/bans         |  GET        | READ        | get all bans              |a

#### (3) Posts API - http://localhost:3006/v1/

| Endpoint                    | HTTP Method | CRUD Method | Result                |
|-----------------------------|-------------|-------------|-----------------------|
| /posts                      | POST        | CREATE      | add a post            |a
| /posts                      | GET         | READ        | get trending posts    | 
| /posts?tag=tag              | GET         | READ        | get posts by tag      | 
| /posts?q=query              | GET         | READ        | get posts by search   | 
| /posts?profile=pid&mode=    | GET         | READ        | get posts by user     | 
| /posts?community=cid&?mode= | GET         | READ        | get community posts   |
| /posts?feed=true            | GET         | READ        | get community posts   |a
| /posts/:slug                | GET         | READ        | get the post          | 
| /posts/:pid                 | PUT         | UPDATE      | update the post       |a
| /posts/:pid                 | DELETE      | DELETE      | delete the post       |a
| /posts/:pid/comments        | POST        | CREATE      | create a comment      |a
| /posts/:pid/comments        | GET         | READ        | get post comments     | 
| /posts/:pid/comments/:cid   | PUT         | UPDATE      | update the comment    |a
| /posts/:pid/comments/:cid   | DELETE      | DELETE      | delete the comment    |a
| /posts/:pid/likes           | POST        | CREATE      | create a post like    |a
| /posts/:pid/likes           | GET         | READ        | get post likes        |a
| /posts/:pid/likes           | DELETE      | DELETE      | delete the like       |a
| /posts/:pid/votes           | POST        | CREATE      | create a post vote    |a
| /posts/:pid/votes           | GET         | READ        | get post votes        |a
| /posts/:pid/votes/:oid      | DELETE      | DELETE      | delete the vote       |a
| /tags                       | GET         | READ        | get all trending tags |
| /tags?q=query               | GET         | READ        | get all tags by query |

#### (4) Partners API - http://localhost:3008/v1/

| Endpoint       | HTTP Method | CRUD Method | Result        |
|----------------|-------------|-------------|---------------|
| /ping          | GET         | READ        | `pong`        |a
| /plans         | POST        | CREATE      | add a plan    |aa
| /plans         | GET         | READ        | get all plans |a
| /plans/:pid    | GET         | READ        | get a plan    | 
| /plans/:pid    | PUT         | UPDATE      | update a plan |aa
| /plans/:pid    | DELETE      | DELETE      | delete a plan |aa
| /apps          | POST        | CREATE      | add an app    |a
| /apps/check    | POST        | CREATE      | check an app  |a
| /apps          | GET         | READ        | get all apps  |aa
| /apps/:aid     | GET         | READ        | get an app    |
| /apps/:aid     | PUT         | UPDATE      | update an app |a
| /apps/:aid     | DELETE      | DELETE      | delete an app |a

<!-- #### (5) Notifications - http://localhost:3010 -->


## Clients

#### (1) Web Client (React-Router) - http://localhost:3000

| Endpoint     | Result                            |
|--------------|-----------------------------------|
| /            | render feed or landing page       |
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