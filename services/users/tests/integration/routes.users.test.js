process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/app');
const knex = require('../../src/db/connection');

chai.use(chaiHttp);
const should = chai.should();

describe('routes : users', () => {
    beforeEach(() => knex.migrate.rollback()
        .then(() => knex.migrate.latest())
        .then(() => knex.seed.run()));

    afterEach(() => knex.migrate.rollback());

    describe('GET /ping', () => {
        it('should return "pong"', () => {
            chai.request(server)
                .get('api/v1/users/ping')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.type.should.eql('text/html');
                    res.text.should.eql('pong');
                });
        });
        it('should haven`t access without token', (done) => {
            chai.request(server)
                .get('api/v1/users/ping')
                .end((err, res) => {
                    should.exist(err);
                    res.status.should.eql(401);
                    res.type.should.eql('application/json');
                    res.body.status.should.eql('Please log in');
                    done();
                });
        });
    });

    describe('POST /users', () => {
        it('should register a new user', (done) => {
            chai.request(server)
                .post('api/v1/users')
                .send({
                    username: 'rixo',
                    fullname: 'ricardo xo',
                    email: 'rico@example.com',
                    password: 'pass5555'
                })
                .end((err, res) => {
                    should.not.exist(err);
                    res.redirects.length.should.eql(0);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status', 'token');
                    res.body.status.should.eql('success');
                    done();
                });
        });
    });

    describe('POST /users/login', () => {
        it('should login a user', (done) => {
            chai.request(server)
                .post('api/v1/users/login')
                .send({
                    username: 'rixo',
                    password: 'pass5555'
                })
                .end((err, res) => {
                    should.not.exist(err);
                    res.redirects.length.should.eql(0);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status', 'token');
                    res.body.status.should.eql('success');
                    should.exist(res.body.token);
                    done();
                });
        });
        it('should not login an unregistered user', (done) => {
            chai.request(server)
                .post('/api/v1/users/login')
                .send({
                    username: 'michael',
                    password: 'douk1234'
                })
                .end((err, res) => {
                    should.exist(err);
                    res.status.should.eql(422);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status', 'failures');
                    res.body.status.should.eql('validation failed');
                    res.body.failures.should.be.a('array');
                    done();
                });
        });
        it('should not login a valid user with incorrect password', (done) => {
            chai.request(server)
                .post('/api/v1/users/login')
                .send({
                    username: 'rixo',
                    password: 'pass5556'
                })
                .end((err, res) => {
                    should.exist(err);
                    res.status.should.eql(422);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status', 'failures');
                    res.body.status.should.eql('validation failed');
                    res.body.failures.should.be.a('array');
                    done();
                });
        });
    });

    describe('GET /users/check', () => {
        it('should return a user id', (done) => {
            chai.request(server)
                .post('/api/v1/users/login')
                .send({
                    username: 'rixo',
                    password: 'pass5556'
                })
                .end((error, response) => {
                    should.not.exist(error);
                    chai.request(server)
                        .get('/api/v1/users/check')
                        .set('Authorization', `Bearer ${response.body.token}`)
                        .end((err, res) => {
                            should.not.exist(err);
                            res.status.should.eql(200);
                            res.type.should.eql('application/json');
                            res.body.should.include.keys('status', 'user');
                            res.body.status.should.eql('success');
                            done();
                        });
                });
        });
        it('should throw an error if a user is not logged in', (done) => {
            chai.request(server)
                .get('/api/v1/users/check')
                .end((err, res) => {
                    should.exist(err);
                    res.status.should.eql(401);
                    res.type.should.eql('application/json');
                    res.body.status.should.eql('No access token');
                    done();
                });
        });
    });

    describe('GET /users/user', () => {
        it('should return a success', (done) => {
            chai.request(server)
                .post('/api/v1/users/login')
                .send({
                    username: 'rixo',
                    password: 'pass5556'
                })
                .end((error, response) => {
                    should.not.exist(error);
                    chai.request(server)
                        .get('/api/v1/users/user')
                        .set('Authorization', `Bearer ${response.body.token}`)
                        .end((err, res) => {
                            should.not.exist(err);
                            res.status.should.eql(200);
                            res.type.should.eql('application/json');
                            res.body.should.include.keys('status', 'data');
                            res.body.status.should.eql('success');
                            done();
                        });
                });
        });
        it('should throw an error if a user is not logged in', (done) => {
            chai.request(server)
                .get('/api/v1/users/user')
                .end((err, res) => {
                    should.exist(err);
                    res.status.should.eql(401);
                    res.type.should.eql('application/json');
                    res.body.status.should.eql('Please log in');
                    done();
                });
        });
    });


    describe('GET /users', () => {
        it('should get users list', (done) => {
            chai.request(server)
                .get('/api/v1/shows')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json; // jshint ignore:line
                    res.body.should.be.a('array');
                    res.body.length.should.equal(4);
                    res.body[0].should.have.property('name');
                    res.body[0].name.should.equal('Suits');
                    res.body[0].should.have.property('channel');
                    res.body[0].channel.should.equal('USA Network');
                    res.body[0].should.have.property('genre');
                    res.body[0].genre.should.equal('Drama');
                    res.body[0].should.have.property('rating');
                    res.body[0].rating.should.equal(3);
                    res.body[0].should.have.property('explicit');
                    res.body[0].explicit.should.equal(false);
                    done();
                });
        });
    });

    describe('GET /users/:name', () => {
        it('should return a single profile', (done) => {
            chai.request(server)
                .get('/api/v1/users/rixo')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json; // jshint ignore:line
                    res.body.should.be.a('object');
                    res.body.should.have.property('name');
                    res.body.name.should.equal('Suits');
                    res.body.should.have.property('channel');
                    res.body.channel.should.equal('USA Network');
                    res.body.should.have.property('genre');
                    res.body.genre.should.equal('Drama');
                    res.body.should.have.property('rating');
                    res.body.rating.should.equal(3);
                    res.body.should.have.property('explicit');
                    res.body.explicit.should.equal(false);
                    done();
                });
        });
    });


    describe('PUT /users', () => {
        it('should update a user data', (done) => {
            chai.request(server)
                .post('/api/v1/users/login')
                .send({
                    username: 'rixo',
                    password: 'pass5556'
                })
                .end((error, response) => {
                    should.not.exist(error);
                    chai.request(server)
                        .put('/api/v1/users')
                        .set('Authorization', `Bearer ${response.body.token}`)
                        .send({
                            description: 'description'
                        })
                        .end((err, res) => {
                            should.not.exist(err);
                            res.status.should.eql(200);
                            res.type.should.eql('application/json');
                            res.body.should.include.keys('status', 'data');
                            res.body.status.should.eql('success');
                            done();
                            chai.request(server)
                                .get('/api/v1/users/user')
                                .set('Authorization', `Bearer ${response.body.token}`)
                                .end((e, r) => {
                                    should.not.exist(e);
                                    r.status.should.eql(200);
                                    r.type.should.eql('application/json');
                                    r.body.should.include.keys('status', 'data');
                                    r.body.status.should.eql('success');
                                    r.body.should.have.property('description');
                                    r.body.description.should.equal('description');
                                    done();
                                });
                        });
                });
        });
        it('should throw an error if a user is not logged in', (done) => {
            chai.request(server)
                .put('/api/v1/users')
                .end((err, res) => {
                    should.exist(err);
                    res.status.should.eql(401);
                    res.type.should.eql('application/json');
                    res.body.status.should.eql('Please log in');
                    done();
                });
        });
    });

    describe('DELETE /users', () => {
        it('should delete a user', (done) => {
            chai.request(server)
                .post('/api/v1/users/login')
                .send({
                    username: 'rixo',
                    password: 'pass5556'
                })
                .end((error, response) => {
                    should.not.exist(error);
                    chai.request(server)
                        .delete('/api/v1/users')
                        .set('Authorization', `Bearer ${response.body.token}`)
                        .end((err, res) => {
                            should.not.exist(err);
                            res.status.should.eql(200);
                            res.type.should.eql('application/json');
                            res.body.should.include.keys('status', 'data');
                            res.body.status.should.eql('success');
                            done();
                            chai.request(server)
                                .post('/api/v1/users/login')
                                .send({
                                    username: 'michael',
                                    password: 'douk1234'
                                })
                                .end((e, r) => {
                                    should.exist(e);
                                    r.status.should.eql(422);
                                    r.type.should.eql('application/json');
                                    r.body.should.include.keys('status', 'failures');
                                    r.body.status.should.eql('validation failed');
                                    r.body.failures.should.be.a('array');
                                    done();
                                });
                        });
                });
        });
        it('should throw an error if a user is not logged in', (done) => {
            chai.request(server)
                .delete('/api/v1/users')
                .end((err, res) => {
                    should.exist(err);
                    res.status.should.eql(401);
                    res.type.should.eql('application/json');
                    res.body.status.should.eql('Please log in');
                    done();
                });
        });


        chai.request(server)
            .delete('/api/v1/shows/1')
            .end(function (error, response) {
                response.should.have.status(200);
                response.should.be.json; // jshint ignore:line
                response.body.should.be.a('object');
                response.body.should.have.property('name');
                response.body.name.should.equal('Suits');
                response.body.should.have.property('channel');
                response.body.channel.should.equal('USA Network');
                response.body.should.have.property('genre');
                response.body.genre.should.equal('Drama');
                response.body.should.have.property('rating');
                response.body.rating.should.equal(3);
                response.body.should.have.property('explicit');
                response.body.explicit.should.equal(false);
                chai.request(server)
                    .get('/api/v1/shows')
                    .end(function (err, res) {
                        res.should.have.status(200);
                        res.should.be.json; // jshint ignore:line
                        res.body.should.be.a('array');
                        res.body.length.should.equal(3);
                        res.body[0].should.have.property('name');
                        res.body[0].name.should.equal('Game of Thrones');
                        res.body[0].should.have.property('channel');
                        res.body[0].channel.should.equal('HBO');
                        res.body[0].should.have.property('genre');
                        res.body[0].genre.should.equal('Fantasy');
                        res.body[0].should.have.property('rating');
                        res.body[0].rating.should.equal(5);
                        res.body[0].should.have.property('explicit');
                        res.body[0].explicit.should.equal(true);
                        done();
                    });
            });
    });
});


res.body.data.length.should.eql(3);
// the first object in the data array should
// have the right keys
res.body.data[0].should.include.keys(
    'id', 'name', 'genre', 'rating', 'explicit'
);

res.body.data.length.should.equal(1);
res.body.data[0].should.have.property('user_id');
res.body.data[0].should.have.property('title');
res.body.data[0].should.have.property('created_at');
res.body.data[1].title.should.eql('Jurrasic World');