process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/app');
const knex = require('../../src/db/connection');

chai.use(chaiHttp);
const should = chai.should();

describe('routes : subscriptions', () => {
    beforeEach(() => knex.migrate.rollback()
        .then(() => knex.migrate.latest())
        .then(() => knex.seed.run()));

    afterEach(() => knex.migrate.rollback());

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
                    res.body.should.have.property('token');
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
                .get('/api/v1/users/check')
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

    describe('GET /users/user', () => {
        it('should return a user data', (done) => {
            chai.request(server)
                .get('/api/v1/users/user')
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status', 'data');
                    res.body.status.should.eql('success');
                    res.body.data.should.include.keys(
                        'username', 'fullname', 'description', 'email', 'avatar'
                    );
                    done();
                });
        });
    });

    describe('GET /users', () => {
        it('should get users list', (done) => {
            chai.request(server)
                .get('/api/v1/users')
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status', 'data');
                    res.body.status.should.eql('success');
                    res.body.should.be.a('array');
                    res.body.data[0].should.include.keys(
                        'id', 'username', 'fullname', 'avatar'
                    );
                    done();
                });
        });
    });

    describe('GET /users/:name', () => {
        it('should return a single profile', (done) => {
            chai.request(server)
                .get('/api/v1/users/rixo')
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status', 'data');
                    res.body.status.should.eql('success');
                    res.body.data.should.include.keys(
                        'id', 'username', 'fullname', 'description', 'avatar'
                    );
                    done();
                });
        });
    });

    describe('GET /users/:name/id', () => {
        it('should return a profile id', (done) => {
            chai.request(server)
                .get('/api/v1/users/rixo/id')
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

    describe('PUT /users', () => {
        it('should update a user data', (done) => {
            chai.request(server)
                .put('/api/v1/users')
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

    describe('DELETE /users', () => {
        it('should delete a user', (done) => {
            chai.request(server)
                .delete('/api/v1/users')
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
});
