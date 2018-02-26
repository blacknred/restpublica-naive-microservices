# Restpublica Microservices - Social media posts App on Docker


## Architecture

| Name            | Service      | Container       | Tech             | Ports |
|-----------------|--------------|-----------------|------------------|-------|
| Web Client      | -            | web-client      | React, Redux     | 3000  |
| Mobile Client   | -            | mobile-client   | React, Redux     | 3001  |
| API Gateway     | -            | api-gateway     | Node, Koa        | 3003  |
| Redis Cache     | -            | redis-cache     | Node, Redis      | 6379  |
| Users API       | Users        | users-api       | Node, Express    | 3004  |
| Users DB        | Users        | users-db        | Postgres         | 5433  |
| Communities API | Communities  | communities-api | Node, Express    | 3005  |
| Communities DB  | Communities  | communities-db  | Postgres         | 5434  |
| Posts API       | Posts        | posts-api       | Node, Express    | 3006  |
| Posts DB        | Posts        | posts-db        | Postgres         | 5435  |
| Mock Storage    | Posts        | files-storage   | Node, Koa        | 3007  |
| Swagger         | Posts        | swagger         | Node, Swagger UI | 3009  |
| Partners API    | Partners     | partners-api    | Node, Express    | 3008  |
| Partners DB     | Partners     | partners-db     | Mongo            | 27017 |
<!-- | Notifications   | Notifications| notifications   | Swagger UI     | 3010 | -->

#### API Gateway - http://localhost:3003

Limit, Filter, Secure
Entry point API for microservices:
* Cluster support to spawn multiple processes.
* Logging
* Consumers (users||apps) registry
* Microservices registry mock
* Js cron

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

#### (1) Users API - http://localhost:3004

##### ping: /api/v1/ping
##### prefix: /api/v1/users

| Endpoint           | HTTP Method | CRUD Method | Result                         |
|--------------------|-------------|-------------|--------------------------------|
| /                  | POST        | CREATE      | add an user                    |
| /login             | POST        | CREATE      | log in an user                 |
| /                  | GET         | READ        | get the trending profiles      |
| /?query=query      | GET         | READ        | get the profiles by search     |
| /?list=uids        | GET         | READ        | get the profiles data by list  |
| /check             | GET         | READ        | check an user, return an id    |
| /user              | GET         | READ        | get all user data              |a
| /:name             | GET         | READ        | get the profile data           |
| /:name/id          | GET         | READ        | get the profile id             |
| /                  | PUT         | UPDATE      | update an user value/file      |a
| /                  | DELETE      | DELETE      | delete an user                 |a
| /:uid/follow       | POST        | CREATE      | create the user subscription   |a
| /:uid/followers    | GET         | READ        | get the profile followers      |a
| /:uid/following    | GET         | READ        | get the profile following      |a
| /:uid/following/id | GET         | READ        | get the user following ids     |a
| /:uid/follow/:sid  | DELETE      | DELETE      | delete the user subscription   |a

#### (2) Communities API - http://localhost:3005

##### ping: /api/v1/ping
##### prefix: /api/v1/communities

| Endpoint           | HTTP Method | CRUD Method | Result                            |
|--------------------|-------------|-------------|-----------------------------------|
| /                  | POST        | CREATE      | add a community                   |a
| /                  | GET         | READ        | get the trending communities      |
| /?query=query      | GET         | READ        | get the communities by search     |
| /?list=cids        | GET         | READ        | get the communities data by list  |
| /?admin=username   | GET         | READ        | get the communities by admin      |a
| /?limiter=dash     | GET         | READ        | get the user following comms ids  |a
| /count?profile=uid | GET         | READ        | get communities count             |
| /:name             | GET         | READ        | get the community data            |
| /:name/id          | GET         | READ        | get the community id              |a
| /:cid              | PUT         | UPDATE      | update the community value/file   |a
| /:cid              | DELETE      | DELETE      | delete the community              |a
| /:cid/follow       | POST        | CREATE      | create the community subscription |a
| /:cid/followers    | GET         | READ        | get the community followers       |a
| /:cid/follow/:sid  | DELETE      | DELETE      | delete the community subscription |a
| /:cid/ban          | POST        | CREATE      | create the community ban          |a
| /:cid/bans         | GET         | READ        | get the community bans list       |a

#### (3) Posts API - http://localhost:3006

##### ping: /api/v1/ping
##### prefix: /api/v1/

| Endpoint                   | HTTP Method | CRUD Method | Result                    |
|----------------------------|-------------|-------------|---------------------------|
| /posts                     | POST        | CREATE      | add a post                |a
| /posts                     | GET         | READ        | get the trending posts    |
| /posts?tag=tag             | GET         | READ        | get the posts by tag      |
| /posts?query=query         | GET         | READ        | get the searched posts    |
| /posts?profiles=pids       | GET         | READ        | get the profiles posts    |
| /posts?communities=cids    | GET         | READ        | get the communities posts |
| /posts/count?profile=uid   | GET         | READ        | get posts count           |
| /posts/count?community=cid | GET         | READ        | get posts count           |
| /posts/:slug               | GET         | READ        | get the post              |
| /posts/:pid                | PUT         | UPDATE      | update the post           |a
| /posts/:pid                | DELETE      | DELETE      | delete the post           |a
| /posts/:pid/comments       | POST        | CREATE      | create the post comment   |a
| /posts/:pid/comments       | GET         | READ        | get the post comments     |
| /posts/:pid/comments/:cid  | PUT         | UPDATE      | update the post comment   |a
| /posts/:pid/comments/:cid  | DELETE      | DELETE      | delete the post comment   |a
| /posts/:pid/likes          | POST        | CREATE      | create the post like      |a
| /posts/:pid/likes          | GET         | READ        | get the post likes list   |a
| /posts/:pid/likes/:lid     | DELETE      | DELETE      | delete the post like      |a
| /tags                      | GET         | READ        | get the trending tags     |
| /tags?query=query          | GET         | READ        | get the tags by search    |


#### (4) Partners API - http://localhost:3008

##### ping: /api/v1/ping
##### prefix: /api/v1/partners

| Endpoint       | HTTP Method | CRUD Method | Result                         |
|----------------|-------------|-------------|--------------------------------|
| /plans         | POST        | CREATE      | add an api plan                |a
| /plans         | GET         | READ        | get all api plans              |a
| /plans/:pid    | GET         | READ        | get an api plan data           | 
| /plans/:pid    | PUT         | UPDATE      | update an api plan data        |a
| /plans/:pid    | DELETE      | DELETE      | delete an api plan             |a
| /apps          | POST        | CREATE      | add an partner app             |a
| /apps/check    | POST        | CREATE      | check partner app existance    |a
| /apps          | GET         | READ        | get all partner apps           |a
| /apps/:pid     | GET         | READ        | get an partner app data        |
| /apps/:pid     | PUT         | UPDATE      | update an partner app data     |a
| /apps/:pid     | DELETE      | DELETE      | delete an partner app          |a


<!-- #### (5) Notifications - http://localhost:3010 -->


## Clients

#### (1) Web Client (React SPA) - http://localhost:3000

| Endpoint     | HTTP Method | CRUD Method | Result                            |
|--------------|-------------|-------------|-----------------------------------|
| /            | GET         | READ        | render dashboard or landing page  |
| /login       | GET         | READ        | login form on landing page        |
| /register    | GET         | READ        | register form on landing page     |
| /logout      | GET         | READ        | log a user out to landing pag     |
| /trending    | GET         | READ        | render popular content            |
| /search      | GET         | READ        | render searched content           |
| /communities | GET         | READ        | render user communities           |
| /activity    | GET         | READ        | render user related activity      |
| /p/:id       | GET         | READ        | render post                       |
| /settings    | GET         | READ        | render settings                   |
| /post        | GET         | READ        | render new post or edit post page |
| /:username   | GET         | READ        | render user data and posts        |

#### (2) Mobile Client (React SPA) - http://localhost:3001

| Endpoint   | HTTP Method | CRUD Method | Result                            |
|------------|-------------|-------------|-----------------------------------|
| /          | GET         | READ        | render landing page               |



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