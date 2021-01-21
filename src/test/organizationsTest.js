var app = require('../index.js'),
request = require('supertest');

function getOrganizationsTest() {
  describe('GET /', function() {
    it('get all organizations', function(done) {
      request(app)
      .get('/organizations/')
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

  function getOrganizationDetailTest() {
    describe('GET /:idOrganization', function() {
      it('get organization detail', function(done) {
        request(app)
        .get('/organizations/1')
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
  function getOrganizationDetailTest() {
    describe('post /', function() {
      it('get organization detail', function(done) {
        request(app)
        .get('/organizations/1')
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

  function updateOrganizationTest() {
    describe('POST /:organizationId', function() {
      it('Update Organization', function(done) {
        request(app)
        .put('/organizations/38')
        .send({organization_name: "Lucerna", status_: 1})
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

  function deleteOrganizationTest() {
    describe('DELETE /:organizationId', function() {
      it('Delete Organization', function(done) {
        request(app)
        .delete('/organizations/38')
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
  function getEventsByOrganizationTest() {
    describe('Get Events by Organization /:organizationId/events', function() {
      it('Get Organizations', function(done) {
        request(app)
        .get('/organizations/2/events')
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


getOrganizationsTest()
getOrganizationDetailTest()
updateOrganizationTest() 
deleteOrganizationTest()
getEventsByOrganizationTest()