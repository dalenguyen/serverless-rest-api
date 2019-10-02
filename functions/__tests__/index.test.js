const request = require('supertest');
const { app } = require('../lib/index');

let createdContactId = '';

describe('POST /contacts', () => {
  test('should ok when sending first name, last name, and email', () => {
    request(app)
      .post('/contacts')
      .send({firstName: 'John', lastName: 'Doe', email: 'johndoe@gmail.com'})
      .expect(201)
      .end(function(err, res) {
        expect(res.text.startsWith('Created a new contact: ')).toBeTruthy();
        createdContactId = res.text.split('Update a new contact: ')[1];
        if (err) throw err;
      });
  });
  test('should throw when sending incorrect body', () => {
    request(app)
      .post('/contacts')
      .send({firstName: 'John', middleName: 'Doe', phoneNumber: '1234567890'})
      .expect(400)
      .end(function(err, res) {
        expect(res.text).toBe('Contact should only contains firstName, lastName and email!!!');
        if (err) throw err;
      });
  });
})

describe('PATCH /contacts/:contactId', () => {
  test('should patch ok', () => {
    request(app)
      .patch(`/contacts/${createdContactId}`)
      .send({firstName: 'Jane', lastName: 'Doe', email: 'janedoe@gmail.com'})
      .expect(204)
      .end(function(err, res) {
        expect(res.text).toBe(`Update a new contact: ${createdContactId}`);
        if (err) throw err;
      });
  });
})

describe('GET /contacts/:contactId', () => {
  test('should get ok', () => {
    request(app)
      .get(`/contacts/${createdContactId}`)
      .expect(200)
      .end(function(err, res) {
        expect(res.body).toMatchObject({firstName: 'Jane', lastName: 'Doe', email: 'janedoe@gmail.com'})
        if (err) throw err;
      });
  });
  test('should 400 if not existed', () => {
    request(app)
      .get(`/contacts/12345678`)
      .expect(400)
      .end(function(err, res) {
        expect(res.text.startsWith('Cannot get contact: ')).toBeTruthy();
        if (err) throw err;
      });
  })
})

describe('DELETE /contacts/:contactId', () => {
  test('should delete ok', () => {
    request(app)
      .delete(`/contacts/${createdContactId}`)
      .expect(204)
      .end(function(err, res) {
        expect(res.text).toBe(`Contact is deleted: ${createdContactId}`);
        if (err) throw err;
      });
  });
})
