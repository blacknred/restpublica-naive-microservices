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

    describe('POST /follow', () => {
        it('should create a new subscription', (done) => {
            chai.request(server)
                .post('api/v1/users/1/follow')
                .send({
                    id: 2
                })
                .end((err, res) => {
                    should.not.exist(err);
                    res.redirects.length.should.eql(0);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status', 'data');
                    res.body.status.should.eql('success');
                    done();
                });
        });
    });

    describe('GET /followers', () => {
        it('should get user followers', (done) => {
            chai.request(server)
                .get('/api/v1/users/2/followers')
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status', 'data');
                    res.body.status.should.eql('success');
                    res.body.should.be.a('array');
                    res.body.data[0].should.include.keys(
                        'count', 'subscriptions'
                    );
                    res.body.data[0].subscriptions.should.include.keys(
                        'sub_id', 'user_id', 'username', 'fullname', 'avatar'
                    );
                    done();
                });
        });
    });

    describe('GET /following', () => {
        it('should get user following', (done) => {
            chai.request(server)
                .get('/api/v1/users/2/following')
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status', 'data');
                    res.body.status.should.eql('success');
                    res.body.should.be.a('array');
                    res.body.data[0].should.include.keys(
                        'count', 'subscriptions'
                    );
                    res.body.data[0].subscriptions.should.include.keys(
                        'sub_id', 'user_id', 'username', 'fullname', 'avatar'
                    );
                    done();
                });
        });
    });

    describe('GET /following/ids', () => {
        it('should get user following id list', (done) => {
            chai.request(server)
                .get('/api/v1/users/2/following/ids')
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status', 'data');
                    res.body.status.should.eql('success');
                    res.body.should.be.a('array');
                    res.body.data[0].should.include.keys('user_id');
                    done();
                });
        });
    });

    describe('DELETE /follow/:sid', () => {
        it('should delete a subscription', (done) => {
            chai.request(server)
                .delete('/api/v1/users/:1/follow/:2')
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
});
