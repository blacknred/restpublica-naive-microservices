# Restpublica Microservices - Social media posts App on Docker



## Architecture

| Name            | Service     | Container       | Tech                       | Ports |
|-----------------|-------------|-----------------|----------------------------|-------|
| Web             | -           | web-client      | React, Redux, React-Router | 3000  |
| Mobile          | -           | mobile-client   | React, Redux, React-Router | 3001  |
| Restpublica API | -           | restpublica-api | Node, Koa                  | 3003  |
| Users API       | Users       | users           | Node, Express              | 3004  |
| Users DB        | Users       | users-db        | Postgres                   |       |
| Communities API | Communities | communities     | Node, Express              | 3005  |
| Communities DB  | Communities | communities-db  | Postgres                   |       |
| Posts API       | Posts       | posts           | Node, Express              | 3006  |
| Posts DB        | Posts       | posts-db        | Postgres                   |       |
| Files Storage   | Posts       | files-storage   | Node, Koa                  | 3007  |
| Swagger         | Posts       | swagger         | Swagger UI                 | 3008  |



## API Gateway

#### Restpublica API - - http://localhost:3003

| Endpoint                                   | HTTP Method | CRUD Method | Secure | Service         |Result                          |
|----------------------------------------- --|-------------|-------------|--------|-----------------|--------------------------------|
| /api/v1/ping                               | GET         | READ        |        | -               |`pong`

| /api/v1/users                              | POST        | CREATE      |        | Users API       |
| /api/v1/login                              | POST        | CREATE      |        | Users API       |
| /api/v1/profile                            | GET         | READ        | true   | Users API       |
| /api/v1/update                             | POST        | CREATE      | true   | Users API       |
| /api/v1/update/userpic                     | DELETE      | DELETE      | true   | Users API       |

| /api/v1/name/:name                         | GET         | CREATE      |        | Users API       |
| /api/v1/id/:name                           | GET         | CREATE      |        | Users API       |
| /api/v1/list/:userids                      | GET         | CREATE      | true   | Users API       |


| /api/v1/posts/dashboard        | GET         | READ        | get a posts feed        |a

## Services

#### (1) Users API - http://localhost:3004

| Endpoint                        | HTTP Method | CRUD Method | Result                         |
|---------------------------------|-------------|-------------|--------------------------------|
| /api/v1/users/ping              | GET         | READ        | `pong`                         |

| /api/v1/users                   | POST        | CREATE      | add an user                    |
| /api/v1/users                   | PUT         | UPDATE      | update an user data value/file |a
| /api/v1/users                   | DELETE      | DELETE      | delete a user                  |a
| /api/v1/users/user              | GET         | READ        | get an user all profile data   |a
| /api/v1/users/check             | GET         | READ        | check an user, return an id    |
| /api/v1/users/login             | POST        | CREATE      | log in an user                 |
<!-- | /api/v1/users/followingids | GET         | READ        | get an user following ids list |a -->

| /api/v1/users/:username         | GET         | READ        | get the profile data           |
| /api/v1/users/:username/id      | GET         | READ        | get the profile id             |

| /api/v1/users/:id/follow        | POST        | CREATE      | create the user subscription   |a
| /api/v1/users/:id/follow/:subid | DELETE      | DELETE      | delete the user subscription   |a
| /api/v1/users/:id/followers     | GET         | READ        | get the profile followers      |a
| /api/v1/users/:id/following     | GET         | READ        | get the profile following      |a

| /api/v1/users                   | GET         | READ        | get the trending profiles      |
| /api/v1/users?query=query       | GET         | READ        | get the searched profiles      |
| /api/v1/users?users=ids         | GET         | READ        | get the profiles list lim data |

#### (2) Communities API - http://localhost:3005

| Endpoint                              | HTTP Method | CRUD Method | Result                            |
|---------------------------------------|-------------|-------------|-----------------------------------|
| /api/v1/communities/ping              | GET         | READ        | `pong`                            |

| /api/v1/communities                   | POST        | CREATE      | add a community                   |a
| /api/v1/communities/:id               | PUT         | UPDATE      | update the community value/file   |a
| /api/v1/communities/:id               | DELETE      | DELETE      | delete the community              |a
<!-- | /api/v1/communities/followingids | GET         | READ        | get the user following ids list  |a-->
| /api/v1/communities/:name             | GET         | READ        | get the community data            |
| /api/v1/communities/:name/id          | GET         | READ        | get the community id              |

| /api/v1/communities/:id/follow        | POST        | CREATE      | create the community subscription |a
| /api/v1/communities/:id/follow/:subid | DELETE      | DELETE      | delete the community subscriptio  |a
| /api/v1/communities/:id/followers     | GET         | READ        | get the community followers       |a

| /api/v1/communities/:id/ban           | POST        | CREATE      | create the community ban          |a
| /api/v1/communities/:id/bans          | GET         | READ        | get the community ban list        |a

| /api/v1/communities                   | GET         | READ        | get the trending communities      |
| /api/v1/communities?query=query       | GET         | READ        | get the searched communities      |
| /api/v1/communities?communities=ids   | GET         | READ        | get the communities lim data      |
| /api/v1/communities?admin=username    | GET         | READ        | get the communities by admin      |a

#### (3) Posts API - http://localhost:3006

| Endpoint                           | HTTP Method | CRUD Method | Result                    |
|------------------------------------|-------------|-------------|---------------------------|
| /api/v1/posts/ping                 | GET         | READ        | `pong`                    |

| /api/v1/posts                      | POST        | CREATE      | add a post                |a
| /api/v1/posts/:slug                | GET         | READ        | get the post              |
| /api/v1/posts/:id                  | PUT         | UPDATE      | update the post           |a
| /api/v1/posts/:id                  | DELETE      | DELETE      | delete the post           |a

| /api/v1/posts/:id/comments         | POST        | CREATE      | create the post comment   |a
| /api/v1/posts/:id/comments         | GET         | READ        | get the post comments     |
| /api/v1/posts/:id/comments/:commid | PUT         | UPDATE      | update the post comment   |a
| /api/v1/posts/:id/comments/:commid | DELETE      | DELETE      | delete the post comment   |a

| /api/v1/posts/:id/likes            | POST        | CREATE      | create the post like      |a
| /api/v1/posts/:id/likes            | GET         | READ        | get the post likes list   |a
| /api/v1/posts/:id/likes/:likeid    | DELETE      | DELETE      | delete the post like      |a

| /api/v1/posts                      | GET         | READ        | get the trending posts    |
| /api/v1/posts?tag=tag              | GET         | READ        | get the posts by tag      |
| /api/v1/posts?query=query          | GET         | READ        | get the searched posts    |
| /api/v1/posts?profiles=ids         | GET         | READ        | get the profiles posts    |
| /api/v1/posts?communities=ids      | GET         | READ        | get the communities posts |

| /api/v1/tags                       | GET         | READ        | get the trending tags     |
| /api/v1/tags?query=query           | GET         | READ        | get the tags by search    |

<!-- | /api/v1/posts/getcount/:id       | GET         | READ        | get user posts count      | -->

#### Files Static Storage - http://localhost:3007

Upload and static server for posts files

#### Swagger - http://localhost:3008/docs

Access Swagger Posts API docs at the above URL

#### Users Database, Communities Database and Posts Database

To access, get the container id from `docker ps` and then open `psql`:

```sh
$ docker exec -ti <container-id> psql -U postgres
```


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