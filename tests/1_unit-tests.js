require("dotenv").config();
const mongoose = require("mongoose");
const chai = require("chai");
const assert = chai.assert;
const dbOp = require("../api/dbOp");

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

suite("Unit Tests", function () {
    suite("Database operations", function () {
        test("addIssue should insert an issue to the database with required fields completed", function (done) {
            mongoose
                .connect(process.env.MONGO_URL, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useCreateIndex: true,
                })
                .then(() => {
                    const issue = {
                        title: "New issue",
                        text: "How to solve this?",
                        creator: "Abdelrahman Said",
                        project: "test",
                    };

                    dbOp.addIssue(issue).then((doc) => {
                        assert.containsAllKeys(doc["_doc"], issue);
                        assert.equal(doc.title, issue.title);
                        assert.equal(doc.text, issue.text);
                        assert.equal(doc.creator, issue.creator);
                        assert.equal(doc.project, issue.project);

                        done();
                    });
                })
                .catch((err) => {
                    console.log(err);

                    assert.fail();

                    done(err);
                });
        });

        test("addIssue should fail if required fields are not provided", function (done) {
            mongoose
                .connect(process.env.MONGO_URL, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useCreateIndex: true,
                })
                .then(() => {
                    const issue = {
                        name: "New issue",
                        description: "How to solve this?",
                        created_by: "Abdelrahman Said",
                        proj_name: "test",
                    };

                    dbOp.addIssue(issue).catch((err) => {
                        assert.hasAnyKeys(err.errors, [
                            "title",
                            "text",
                            "creator",
                            "project",
                        ]);

                        done();
                    });
                })
                .catch((err) => {
                    console.log(err);

                    assert.fail();

                    done(err);
                });
        });

        test("updateIssue should update the document with all new fields", function (done) {
            mongoose
                .connect(process.env.MONGO_URL, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useCreateIndex: true,
                })
                .then(() => {
                    const update = {
                        open: false,
                        assignee: "amsaid1989",
                        status: "completed",
                        text: "more useful text",
                    };

                    dbOp.updateIssue("60a7019b3597df42ec4cc1f7", update).then(
                        (doc) => {
                            assert.containsAllKeys(doc["_doc"], update);
                            assert.equal(doc.open, update.open);
                            assert.equal(doc.assignee, update.assignee);
                            assert.equal(doc.status, update.status);
                            assert.equal(doc.text, update.text);

                            done();
                        }
                    );
                })
                .catch((err) => {
                    console.log(err);

                    assert.fail();

                    done(err);
                });
        });
    });
});
