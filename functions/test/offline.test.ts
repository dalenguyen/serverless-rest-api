import "jest";
import {stub, SinonStub} from "sinon";
import * as admin from "firebase-admin";
import { HttpsFunction } from "firebase-functions";
import * as request from "supertest";

describe("API testing", function() {
  let webApi:HttpsFunction,
    adminInitStub:SinonStub,
    originalFirestore:(app: admin.app.App) => admin.firestore.Firestore;
  
  const collectionStub = stub();
  const firestoreStub = stub().returns({ collection: collectionStub});
    
  beforeAll(() => {
    adminInitStub = stub(admin, "initializeApp");
    originalFirestore = admin.firestore;
    Object.defineProperty(admin, "firestore", {get: () => firestoreStub});
    const myFunctions = require("../src/index");
    webApi = myFunctions.webApi;
  });

  afterAll(() => {
    adminInitStub.restore();
    Object.defineProperty(admin, "firestore", originalFirestore);
  });

  it("View All Contacts", function(done){
    const contacts = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john@doe.com"
      }
    ].map((contact, id) => ({ data: () => contact, id}));

    collectionStub
      .withArgs("contacts")
      .returns({get: () => Promise.resolve(contacts)});

    request(webApi)
      .get("/api/v1/contacts")
      .expect(200)
      .end((err, res) => {
        const contacts = Object.entries(res.body["contacts"]);
        expect(contacts.length).toEqual(1);
        done()
      });
  });

  describe("Add new contact", function() {

    beforeAll(() => {
      collectionStub.resetBehavior();
      collectionStub
        .withArgs("contacts")
        .returns({add: (contact:any) => Promise.resolve({id: 1, get: () => contact})});
    })

    it("Should OK when post with firstName, lastName and email.", function(done) {

      request(webApi)
        .post("/api/v1/contacts")
        .set('Content-Type', 'application/json')
        .send({firstName: 'John', lastName: 'Doe', email: 'johndoe@gmail.com'})
        .expect(201)
        .end((err, res) => {
          expect(res.text).toMatch("Created a new contact:");
          done();
        })
    });
  
    it("Should throw when sending wrong data", function(done) {

      request(webApi)
        .post("/api/v1/contacts")
        .set('Content-Type', 'application/json')
        .send({firstName: 'John', lastName: 'Doe', phone: '0123456789'})
        .expect(400)
        .end((err, res) => {
          expect(res.text).toMatch("Contact should only contains firstName, lastName and email!!!");
          done();
        })
    });
  });

  describe("View a contact", function() {

    beforeAll(() => {
      collectionStub.resetBehavior();
      const contacts = [
        {
          firstName: "John",
          lastName: "Doe",
          email: "john@doe.com"
        },
        {
          firstName: "Alex",
          lastName: "Smith",
          email: "alex@smith.com"
        }
      ].map((contact, id) => ({ data: () => contact, id, exists: true}));
  
      collectionStub
        .withArgs("contacts")
        .returns({
          get: () => Promise.resolve(contacts),
          doc: (id: any) => ({
            get: () => Promise.resolve(contacts[id])
          })
        });
    });

    it("Should OK to get contact id: 0", function(done){
      
      request(webApi)
        .get("/api/v1/contacts/0")
        .expect(200)
        .end((err, res) => {
          const contact = res.body;
          expect(contact.firstName).toBe("John");
          expect(contact.lastName).toBe("Doe");
          expect(contact.email).toBe("john@doe.com");
          done()
        });
    });

    it("Should Throw to get contact id: 2", function(done){
      
      request(webApi)
        .get("/api/v1/contacts/2")
        .expect(400)
        .end(() => done());
    });
  });

});
