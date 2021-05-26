require("dotenv").config();
process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const chai = require("chai");
const assert = chai.assert;
const dbOp = require("../api/dbOp");

const mongoServer = new MongoMemoryServer();
mongoose.Promise = Promise;

describe("Unit Tests", function () {
    describe("Database operations", function () {
        describe("addIssue", function () {
            it("should insert an issue to the database with required fields completed", function (done) {
                const issue = {
                    issue_title: "New issue",
                    issue_text: "How to solve this?",
                    created_by: "Abdelrahman Said",
                    project: "test",
                };

                dbOp.addIssue(issue)
                    .then((doc) => {
                        assert.containsAllKeys(doc["_doc"], issue);
                        assert.equal(doc.issue_title, issue.issue_title);
                        assert.equal(doc.issue_text, issue.issue_text);
                        assert.equal(doc.created_by, issue.created_by);
                        assert.equal(doc.project, issue.project);
                        assert.isEmpty(doc.assigned_to);
                        assert.isEmpty(doc.status_text);

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

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
                            "issue_title",
                            "issue_text",
                            "created_by",
                            "project",
                        ]);

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });
        });

        describe("getIssue", function () {
            it("should find an existing issue using its id", function (done) {
                dbOp.addIssue({
                    issue_title: "my issue",
                    issue_text: "trying to look for a solution here",
                    created_by: "Abdelrahman Said",
                    project: "Great project",
                })
                    .then((newDoc) => {
                        dbOp.getIssue(newDoc.id).then((doc) => {
                            assert.isNotNull(doc);
                            assert.containsAllKeys(doc, newDoc);
                            assert.equal(doc.issue_title, newDoc.issue_title);
                            assert.equal(doc.issue_text, newDoc.issue_text);
                            assert.equal(doc.created_by, newDoc.created_by);
                            assert.equal(doc.project, newDoc.project);

                            done();
                        });
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });

            it("should return null when the provided id doesn't exist", function (done) {
                dbOp.getIssue("764f4beed44983c994adeb33")
                    .then((doc) => {
                        assert.isNull(doc);

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });
        });

        describe("findIssues", function () {
            it("should return all documents that match the criteria provided in the search object", async function () {
                for (let i = 0; i < 5; i++) {
                    const doc = await dbOp.addIssue({
                        issue_title: `issue ${i}`,
                        issue_text: "This is issue #${i}",
                        created_by: "Abdelrahman Said",
                        project: "test project",
                    });
                }

                const results = await dbOp.findIssues({
                    created_by: "Abdelrahman Said",
                    project: "test project",
                });

                assert.isArray(results);
                assert.isNotEmpty(results);
                assert.equal(results.length, 5);
            });

            it("should return an empty array if no documents were found", async function () {
                const results = await dbOp.findIssues({
                    created_by: "amsaid1989",
                });

                assert.isArray(results);
                assert.isEmpty(results);
            });
        });

        describe("updateIssue", function () {
            it("should update the document with all new fields and set the updated_on date", function (done) {
                dbOp.addIssue({
                    issue_title: "my new issue",
                    issue_text: "can someone help me?",
                    created_by: "Abdelrahman Said",
                    project: "blah blah",
                })
                    .then((newDoc) => {
                        const update = {
                            open: false,
                            assigned_to: "amsaid1989",
                            issue_text: "completed",
                            status_text: "more useful text",
                        };

                        dbOp.updateIssue(newDoc["_id"], update).then((doc) => {
                            assert.containsAllKeys(doc["_doc"], update);
                            assert.equal(doc.open, update.open);
                            assert.equal(doc.assigned_to, update.assigned_to);
                            assert.equal(doc.status_text, update.status_text);
                            assert.equal(doc.issue_text, update.issue_text);
                            assert.isAbove(
                                doc["updated_on"],
                                newDoc["updated_on"]
                            );

                            done();
                        });
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });
        });

        describe("removeIssue", function () {
            it("should remove an existing document using its id", async function () {
                const doc = await dbOp.addIssue({
                    issue_title: "new issue",
                    issue_text: "an issue to delete",
                    created_by: "Abdelrahman Said",
                    project: "test",
                });

                const deleted = await dbOp.removeIssue(doc.id);
                const search = await dbOp.getIssue(doc.id);

                assert.isNotEmpty(deleted);
                assert.equal(deleted.deletedCount, 1);
                assert.isNull(search);
            });

            it("should return an object with deletedCount of 0 if the id does not exist", async function () {
                const deleted = await dbOp.removeIssue(
                    "123456789098765432101234"
                );

                assert.isNotEmpty(deleted);
                assert.equal(deleted.deletedCount, 0);
            });
        });
    });
});
