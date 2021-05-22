require("dotenv").config();
process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const chai = require("chai");
const assert = chai.assert;
const dbOp = require("../api/dbOp");

const mongoServer = new MongoMemoryServer();
mongoose.Promise = Promise;

// mongoose
//     .connect(process.env.MONGO_URL, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         useCreateIndex: true,
//     })
//     .then(() => {})
//     .catch((err) => {
//         assert.fail();

//         done(err);
//     });

describe("Unit Tests", function () {
    describe("Database operations", function () {
        before(function (done) {
            mongoServer
                .getUri()
                .then((mongoURI) => {
                    mongoose
                        .connect(mongoURI, {
                            useNewUrlParser: true,
                            useUnifiedTopology: true,
                        })
                        .then(() => done());
                })
                .catch((err) => {
                    console.log(err);

                    assert.fail();

                    done(err);
                });
        });

        describe("addIssue", function () {
            it("should insert an issue to the database with required fields completed", function (done) {
                const issue = {
                    title: "New issue",
                    text: "How to solve this?",
                    creator: "Abdelrahman Said",
                    project: "test",
                };

                dbOp.addIssue(issue)
                    .then((doc) => {
                        assert.containsAllKeys(doc["_doc"], issue);
                        assert.equal(doc.title, issue.title);
                        assert.equal(doc.text, issue.text);
                        assert.equal(doc.creator, issue.creator);
                        assert.equal(doc.project, issue.project);

                        done();
                    })
                    .catch((err) => {
                        console.log(err);

                        assert.fail();

                        done(err);
                    });
            });

            it("should fail if required fields are not provided", function (done) {
                const issue = {
                    name: "New issue",
                    description: "How to solve this?",
                    created_by: "Abdelrahman Said",
                    proj_name: "test",
                };

                dbOp.addIssue(issue)
                    .catch((err) => {
                        assert.hasAnyKeys(err.errors, [
                            "title",
                            "text",
                            "creator",
                            "project",
                        ]);

                        done();
                    })
                    .catch((err) => {
                        console.log(err);

                        assert.fail();

                        done(err);
                    });
            });
        });

        describe("updateIssue", function () {
            it("should update the document with all new fields and set the updated_on date", function (done) {
                dbOp.addIssue({
                    title: "my new issue",
                    text: "can someone help me?",
                    creator: "Abdelrahman Said",
                    project: "blah blah",
                })
                    .then((newDoc) => {
                        const update = {
                            open: false,
                            assignee: "amsaid1989",
                            status: "completed",
                            text: "more useful text",
                        };

                        dbOp.updateIssue(newDoc["_id"], update).then((doc) => {
                            assert.containsAllKeys(doc["_doc"], update);
                            assert.equal(doc.open, update.open);
                            assert.equal(doc.assignee, update.assignee);
                            assert.equal(doc.status, update.status);
                            assert.equal(doc.text, update.text);
                            assert.isAbove(
                                doc["updated_on"],
                                newDoc["updated_on"]
                            );

                            done();
                        });
                    })
                    .catch((err) => {
                        console.log(err);

                        assert.fail();

                        done(err);
                    });
            });
        });
    });
});
