var app = require('../index.js'),
request = require('supertest');

function getMaleFemaleUsers() {
  describe('GET /MaleFemale/total', function() {
    it('Get users total by gender', function(done) {
      request(app)
      .get('/dashboard/MaleFemale/total')
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

function getUsersCountry() {
    describe('GET /users/country', function() {
      it('Get users total by country', function(done) {
        request(app)
        .get('/dashboard/users/country')
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

  function getUsersByStatus() {
    describe('GET /users/ActiveInactive', function() {
      it('Get total users by status', function(done) {
        request(app)
        .get('/dashboard/users/ActiveInactive')
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
  function getNumberOfEventsPerOrganization() {
    describe('GET /organizations/:organizationId', function() {
      it('Get total users by status', function(done) {
        request(app)
        .get('/dashboard/organizations/1')
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
  function getEventsByType() {
    describe('GET /events/type', function() {
      it('Get total users by status', function(done) {
        request(app)
        .get('/dashboard/organizations/1')
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


getMaleFemaleUsers()
getUsersCountry()
getUsersByStatus()
getNumberOfEventsPerOrganization()
getEventsByType()