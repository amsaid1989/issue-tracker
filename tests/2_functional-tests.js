require("dotenv").config();
process.env.NODE_ENV = "test";

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const mongoose = require("mongoose");

chai.use(chaiHttp);

describe("Functional Tests", function () {
    describe("ROUTE /api/issues", function () {
        describe("POST /apitest", function () {
            it("Create an issue with every field: POST request to /api/issues/apitest", function (done) {
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

            it("Create an issue with only required fields: POST request to /api/issues/apitest", function (done) {
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
                        assert.isUndefined(res.body.assigned_to);
                        assert.isUndefined(res.body.status_text);

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        return done(err);
                    });
            });

            it("Create an issue with missing required fields: POST request to /api/issues/apitest", function (done) {
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

                        done();
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        return done(err);
                    });
            });
        });

        describe("GET /apitest", function () {
            before(function (done) {
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

            it("View issues on a project: GET request to /api/issues/apitest", function (done) {
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

            it("View issues on a project with one filter: GET request to /api/issues/apitest", function (done) {
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

            it("View issues on a project with multiple filters: GET request to /api/issues/apitest", function (done) {
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

        describe("PUT /apitest", function () {
            it("Update one field on an issue: PUT request to /api/issues/apitest", function (done) {
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

            it("Update multiple fields on an issue: PUT request to /api/issues/apitest", function (done) {
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

            it("Update an issue with missing _id: PUT request to /api/issues/apitest", function (done) {
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
                                assert.equal(putRes.body.error, "missing id");

                                done();
                            });
                    })
                    .catch((err) => {
                        console.error(err);

                        assert.fail();

                        done(err);
                    });
            });

            it("Update an issue with no fields to update: PUT request to /api/issues/apitest", function (done) {
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

            it("Update an issue with an invalid _id: PUT request to /api/issues/apitest", function (done) {
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
    });
});
