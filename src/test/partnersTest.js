var app = require('../index.js'),
request = require('supertest');

function getPartnersOfEvents() {
  describe('GET /events/:eventId', function() {
    it('Get partners of event', function(done) {
      request(app)
      .get('/partners/events/2')
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
function getPartnersByOrg() {
    describe('GET /organizations/:organizationId', function() {
      it('Get partners of organization', function(done) {
        request(app)
        .get('/partners/organizations/2')
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




getPartnersOfEvents()
getPartnersByOrg()