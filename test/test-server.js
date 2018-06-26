
const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// Needed to make http requests in tests
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe("Blog Posts", function() {
  //run the server first, which returns a promise
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  // test strategy:
  //   1. GET request to endpoint `/shopping-list`
  //   2. Check the response object and make sure it has the necessary propoerties
  it("should list items on GET", function() {
    // for Mocha tests, when we're dealing with asynchronous operations,
    // we must either return a Promise object or else call a `done` callback
    // at the end of the test. The `chai.request(server).get...` call is asynchronous
    // and returns a Promise, so we just return it.
    return chai
      .request(app)
      .get("/blog-posts")
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a("array");

        // because we create three items on app load
        expect(res.body.length).to.be.at.least(1);
        // each item should be an object with key/value pairs
        // for `id`, `name` and `checked`.
        const expectedKeys = ["id", "title", "content","author","publishDate"];
        res.body.forEach(function(item) {
          expect(item).to.be.a("object");
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  // make a new POST request for a new item
  // check responseresponse object and prove it has right
  // status code and that the returned object has an `id`
  it("should add an item on POST", function() {
    const newItem = { title: "Post", content: "this is my post",author: "John" };
    return chai
      .request(app)
      .post("/blog-posts")
      .send(newItem)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        //expect(res.body).to.have.all.keys(expectedKeys);
        expect(res.body.title).to.equal(newItem.title);
        expect(res.body.content).to.equal(newItem.content);
        expect(res.body.author).to.equal(newItem.author);
        
      });
  });

  
  //  1. initialize some update data (we won't have an `id` yet)
  //  2. make a GET request so we can get an item to update
  //  3. add the `id` to `updateData`
  //  4. Make a PUT request with `updateData`
  //  5. Inspect the response object to ensure it
  //  has right status code and that we get back an updated
  //  item with the right data in it.

  it("should update existing blog on PUT", function() {    
    return (chai.request(app)
        // gets an element first to know what to update
        .get("/blog-posts")
        .then(function(res) {
        	const updateData = Object.assign(res.body[0], {
          title: 'connect the dots',
          content: 'la la la la la'
        });
          return chai
            .request(app)
            .put(`/blog-posts/${res.body[0].id}`)
            .send(updateData);
        })
        // Checks for 204 status which means the update was successful
        .then(function(res) {
          expect(res).to.have.status(204);
        
        })
    );
  });

  // GET shopping list entry for an ID
  // Delete item and ensure a status code of 204
  it("should delete items on DELETE", function() {
    return (
      chai
        .request(app)
        .get("/blog-posts")
        .then(function(res) {
    return chai.request(app).delete(`/blog-posts/${res.body[0].id}`);
        })
        	.then(function(res) {
        	expect(res).to.have.status(204);
        })
    );
  });
});

//End