process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../src/app');

chai.use(chaiHttp);
const should = chai.should();

describe('routes : index', () => {
    describe('GET /ping', () => {
        it('should return "pong"', () => {
            chai.request(server)
                .get('api/v1/users/ping')
                .end((err, res) => {
                    should.not.exist(err);
                    res.type.should.eql('text/html');
                    res.text.should.eql('pong');
                });
        });
    });
});
