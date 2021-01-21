var app = require('../index.js'),
request = require('supertest');

function getEvents() {
  describe('GET /', function() {
    it('Get all events', function(done) {
      request(app)
      .get('/events/')
      .send()
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
    });
  });
}


  function getUpcomingEvents() {
    describe('GET /users/upcoming', function() {
      it('Get 6 upcoming nearest events', function(done) {
        request(app)
        .get('/events/upcoming')
        .send()
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
      });
    });
  }

  function getEventDetailById() {
    describe('GET /:idEvent', function() {
      it('Get event detail by id', function(done) {
        request(app)
        .get('/events/:idEvent')
        .send()
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
      });
    });
  }


getEvents()
getUpcomingEvents()
getEventDetailById()
