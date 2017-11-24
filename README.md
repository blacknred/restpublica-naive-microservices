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
