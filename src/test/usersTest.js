var app = require('../index.js'),
request = require('supertest');

function loginTest() {
  describe('POST /validate', function() {
    it('logs user in', function(done) {
      request(app)
      .post('/users/validate')
      .send({email: 'obiwan@gmail.com', password: 'c6master'})
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

function signUpTest() {
  describe('POST /', function() {
    it('User Sign up', function(done) {
      request(app)
      .post('/users/')
      .send({email: 'obiwan@gmail.com', password: 'c6master', 
        full_name: 'Joel Gaspar', birthday: '1993-09-13',
        gender: 'Male', country: 'México'})
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

function updateAvatar() {
  describe('PUT /updateAvatar', function() {
    it('Update Avatar', function(done) {
      request(app)
      .put('/users/1/updateAvatar')
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
function updateUser() {
  describe('PUT /:userId', function() {
    it('Update user', function(done) {
      request(app)
      .put('/users/2/')
      .send({full_name: 'Joel Gaspar', birthday: '1993-09-13'})
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

function updatePassword() {
  describe('PUT /:userId/password', function() {
    it('Update user', function(done) {
      request(app)
      .put('/users/1/password')
      .send({psswd: 'Joel Gaspar'})
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


function deleteUser() {
  describe('PUT /:userId/', function() {
    it('Update user', function(done) {
      request(app)
      .delete('/users/1/')
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



function getUsersTest() {
  describe('get /', function() {
    it('get list of users', function(done) {
      request(app)
      .get('/users/')
      .send()
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
    });
  });
}
function getUserDetail() {
  describe('get /', function() {
    it('get detail of user', function(done) {
      request(app)
      .get('/users/1')
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

loginTest()
getUsersTest()
getUserDetail()
signUpTest()
updateAvatar()
updateUser()
updatePassword()
deleteUser() 