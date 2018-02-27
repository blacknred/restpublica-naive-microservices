process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
chai.use(chaiHttp);

const server = require('../../src/app');

  describe('GET /api/v1/ping', () => {
    it('should return "pong"', () => {
      chai.request(server)
      .get('/api/v1/ping')
      .end((err, res) => {
        res.type.should.eql('text/html');
        res.text.should.eql('pong');
      });
    });
  });

  describe('POST /api/v1/plans', () => {
    it('should create a new API plan', () => {
      chai.request(server)
      .post('/api/v1/plans')
      .set('authorization', `Bearer foobar`)
      .send({ title: 'Jurrasic World' })
      .end((err, res) => {
        res.should.have.status(200);
        res.type.should.equal('application/json');
        res.body.should.be.a('object');
        res.body.status.should.equal('success');
        res.body.data.should.equal('Movie Added!');
        chai.request(server)
        .get('/movies/user')
        .set('authorization', `Bearer foobar`)
        .end((err, res) => {
          res.type.should.equal('application/json');
          res.body.status.should.equal('success');
          res.body.data.should.be.a('array');
          res.body.data.length.should.equal(2);
          res.body.data[1].title.should.eql('Jurrasic World');
        });
      });
    });
  });

  describe('GET /api/v1/partners', () => {
    it('should return saved movies', () => {
      chai.request(server)
      .get('/movies/user')
      .set('authorization', `Bearer foobar`)
      .end((err, res) => {
        res.type.should.equal('application/json');
        res.body.status.should.equal('success');
        res.body.data.should.be.a('array');
        res.body.data.length.should.equal(1);
        res.body.data[0].should.have.property('user_id');
        res.body.data[0].should.have.property('title');
        res.body.data[0].should.have.property('created_at');
      });
    });
  });

