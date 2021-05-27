require("dotenv").config();
// process.env.NODE_ENV = "test";

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const mongoose = require("mongoose");
const dbOp = require("../api/dbOp");

chai.use(chaiHttp);

suite("Functional Tests", function () {
    suiteSetup(function (done) {
        dbOp.connect().then(() => {
            done();
        });
    });

    suite("ROUTE /api/issues", function () {
        suite("POST /apitest", function () {
            test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
                const issue = {
                    issue_title: "Test issue",
                    issue_text: "I have an issue",
                    created_by: "Abdelrahman Said",
                    assigned_to: "amsaid1989",
                    status_text: "under review",
                };

                chai.request(server)
                    .post("/api/issues/apitest")
                    .send(issue)
                    .then((res) => {
                        assert.ok(res);
                        assert.equal(res.status, 200);
                        assert.isNotEmpty(res.body);
                        assert.containsAllKeys(res.body, issue);

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        return done(err);
                    });
            });

            test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
                const issue = {
                    issue_title: "Test issue",
                    issue_text: "I have an issue",
                    created_by: "Abdelrahman Said",
                };

                chai.request(server)
                    .post("/api/issues/apitest")
                    .send(issue)
                    .then((res) => {
                        assert.ok(res);
                        assert.equal(res.status, 200);
                        assert.isNotEmpty(res.body);
                        assert.containsAllKeys(res.body, issue);
                        assert.isEmpty(res.body.assigned_to);
                        assert.isEmpty(res.body.status_text);

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        return done(err);
                    });
            });

            test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
                const issue = {
                    issue_title: "Test issue",
                    status_text: "I have an issue",
                    assigned_to: "Abdelrahman Said",
                };

                chai.request(server)
                    .post("/api/issues/apitest")
                    .send(issue)
                    .then((res) => {
                        assert.ok(res);
                        assert.equal(res.status, 200);
                        assert.isNotEmpty(res.body);
                        assert.containsAllKeys(res.body, ["error"]);
                        assert.equal(
                            res.body.error,
                            "required field(s) missing"
                        );

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        return done(err);
                    });
            });
        });

        suite("GET /apitest", function () {
            suiteSetup(function (done) {
                const issue1 = {
                    issue_title: "Test issue",
                    issue_text: "I have an issue",
                    created_by: "Abdelrahman Said",
                };

                const issue2 = {
                    issue_title: "Test issue 2",
                    issue_text: "I have an issue",
                    created_by: "Abdelrahman",
                };

                const issue3 = {
                    issue_title: "Test issue 3",
                    issue_text: "I have an issue",
                    created_by: "Abdelrahman",
                    assigned_to: "amsaid1989",
                };

                mongoose.connection
                    .dropCollection("issues")
                    .then(() => {
                        const requester = chai.request(server).keepOpen();

                        requester
                            .post("/api/issues/apitest")
                            .send(issue1)
                            .then(() => {
                                requester
                                    .post("/api/issues/apitest")
                                    .send(issue2)
                                    .then(() => {
                                        requester
                                            .post("/api/issues/apitest")
                                            .send(issue3)
                                            .then((res) => {
                                                requester.close();

                                                done();
                                            });
                                    });
                            });
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });

            test("View issues on a project: GET request to /api/issues/{project}", function (done) {
                chai.request(server)
                    .get("/api/issues/apitest")
                    .then((res) => {
                        assert.ok(res);
                        assert.isNotEmpty(res.body);
                        assert.isArray(res.body);
                        assert.lengthOf(res.body, 3);

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        return done(err);
                    });
            });

            test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
                chai.request(server)
                    .get("/api/issues/apitest")
                    .query({ created_by: "Abdelrahman" })
                    .then((res) => {
                        assert.ok(res);
                        assert.isNotEmpty(res.body);
                        assert.isArray(res.body);
                        assert.lengthOf(res.body, 2);

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        return done(err);
                    });
            });

            test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
                chai.request(server)
                    .get("/api/issues/apitest")
                    .query({
                        created_by: "Abdelrahman",
                        assigned_to: "amsaid1989",
                    })
                    .then((res) => {
                        assert.ok(res);
                        assert.isNotEmpty(res.body);
                        assert.isArray(res.body);
                        assert.lengthOf(res.body, 1);

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        return done(err);
                    });
            });
        });

        suite("PUT /apitest", function () {
            test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
                const request = chai.request(server).keepOpen();

                request
                    .get("/api/issues/apitest")
                    .query({
                        created_by: "Abdelrahman",
                        assigned_to: "amsaid1989",
                    })
                    .then((getRes) => {
                        const doc = getRes.body[0];

                        const updateObj = { _id: doc["_id"], assigned_to: "" };

                        request
                            .put("/api/issues/apitest")
                            .send(updateObj)
                            .then((putRes) => {
                                request.close();

                                assert.ok(putRes);
                                assert.equal(putRes.status, 200);
                                assert.isNotEmpty(putRes.body);
                                assert.containsAllKeys(putRes.body, [
                                    "result",
                                    "_id",
                                ]);
                                assert.equal(
                                    putRes.body.result,
                                    "successfully updated"
                                );
                                assert.equal(putRes.body["_id"], doc["_id"]);

                                done();
                            });
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });

            test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
                const request = chai.request(server).keepOpen();

                request
                    .get("/api/issues/apitest")
                    .query({
                        created_by: "Abdelrahman",
                    })
                    .then((getRes) => {
                        const doc = getRes.body[0];

                        const updateObj = {
                            _id: doc["_id"],
                            assigned_to: "amsaid1989",
                            status_text: "solved",
                            open: false,
                        };

                        request
                            .put("/api/issues/apitest")
                            .send(updateObj)
                            .then((putRes) => {
                                request.close();

                                assert.ok(putRes);
                                assert.equal(putRes.status, 200);
                                assert.isNotEmpty(putRes.body);
                                assert.containsAllKeys(putRes.body, [
                                    "result",
                                    "_id",
                                ]);
                                assert.equal(
                                    putRes.body.result,
                                    "successfully updated"
                                );
                                assert.equal(putRes.body["_id"], doc["_id"]);

                                done();
                            });
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });

            test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
                const request = chai.request(server).keepOpen();

                request
                    .get("/api/issues/apitest")
                    .query({
                        created_by: "Abdelrahman",
                    })
                    .then((getRes) => {
                        const doc = getRes.body[0];

                        const updateObj = { assigned_to: "" };

                        request
                            .put("/api/issues/apitest")
                            .send(updateObj)
                            .then((putRes) => {
                                request.close();

                                assert.ok(putRes);
                                assert.equal(putRes.status, 200);
                                assert.isNotEmpty(putRes.body);
                                assert.containsAllKeys(putRes.body, ["error"]);
                                assert.equal(putRes.body.error, "missing _id");

                                done();
                            });
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });

            test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
                const request = chai.request(server).keepOpen();

                request
                    .get("/api/issues/apitest")
                    .query({
                        created_by: "Abdelrahman",
                    })
                    .then((getRes) => {
                        const doc = getRes.body[0];

                        const updateObj = { _id: doc["_id"] };

                        request
                            .put("/api/issues/apitest")
                            .send(updateObj)
                            .then((putRes) => {
                                request.close();

                                assert.ok(putRes);
                                assert.equal(putRes.status, 200);
                                assert.isNotEmpty(putRes.body);
                                assert.containsAllKeys(putRes.body, [
                                    "error",
                                    "_id",
                                ]);
                                assert.equal(
                                    putRes.body.error,
                                    "no update field(s) sent"
                                );
                                assert.equal(putRes.body["_id"], doc["_id"]);

                                done();
                            });
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });

            test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
                const updateObj = {
                    _id: "766a76c797d98797f987e",
                    assigned_to: "amsaid1989",
                };

                chai.request(server)
                    .put("/api/issues/apitest")
                    .send(updateObj)
                    .then((res) => {
                        assert.ok(res);
                        assert.equal(res.status, 200);
                        assert.isNotEmpty(res.body);
                        assert.containsAllKeys(res.body, ["error", "_id"]);
                        assert.equal(res.body.error, "could not update");
                        assert.equal(res.body["_id"], "766a76c797d98797f987e");

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });
        });

        suite("DELETE /apitest", function () {
            test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
                const request = chai.request(server).keepOpen();

                request
                    .get("/api/issues/apitest")
                    .query({ assigned_to: "amsaid1989" })
                    .then((res) => {
                        const id = res.body[0]["_id"];

                        request
                            .delete("/api/issues/apitest")
                            .send({ _id: id })
                            .then((res) => {
                                request.close();

                                assert.ok(res);
                                assert.equal(res.status, 200);
                                assert.isNotEmpty(res.body);
                                assert.containsAllKeys(res.body, [
                                    "result",
                                    "_id",
                                ]);
                                assert.equal(
                                    res.body["result"],
                                    "successfully deleted"
                                );
                                assert.equal(res.body["_id"], id);

                                done();
                            });
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });

            test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
                const id = "2f853fac798ecb312af7803d";

                chai.request(server)
                    .delete("/api/issues/apitest")
                    .send({ _id: id })
                    .then((res) => {
                        assert.ok(res);
                        assert.equal(res.status, 200);
                        assert.isNotEmpty(res.body);
                        assert.containsAllKeys(res.body, ["error", "_id"]);
                        assert.equal(res.body["error"], "could not delete");
                        assert.equal(res.body["_id"], id);

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });

            test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
                chai.request(server)
                    .delete("/api/issues/apitest")
                    .then((res) => {
                        assert.ok(res);
                        assert.equal(res.status, 200);
                        assert.isNotEmpty(res.body);
                        assert.containsAllKeys(res.body, ["error"]);
                        assert.equal(res.body.error, "missing _id");

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });
        });
    });
});
