 var app = require('../index.js'),
request = require('supertest');

function getEventDifusion() {
  describe('GET /events/:eventId', function() {
    it('Get difusion info for event', function(done) {
      request(app)
      .get('/difusion/events/1')
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


function updateEventDifusion() {
    describe('PUT /events/:eventId', function() {
      it('Update difusion info for event', function(done) {
        request(app)
        .put('/difusion/events/45')
        .send({title: 'Dont forget to assist!', message: "I did a test"})
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
getEventDifusion()
updateEventDifusion() 
