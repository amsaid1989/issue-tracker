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
                    .end((err, res) => {
                        if (err) {
                            console.error(err);

                            assert.fail();

                            return done(err);
                        }

                        assert.ok(res);
                        assert.equal(res.status, 200);
                        assert.isNotEmpty(res.body);
                        assert.containsAllKeys(res.body, issue);

                        done();
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
                    .end((err, res) => {
                        if (err) {
                            console.error(err);

                            assert.fail();

                            return done(err);
                        }

                        assert.ok(res);
                        assert.equal(res.status, 200);
                        assert.isNotEmpty(res.body);
                        assert.containsAllKeys(res.body, issue);
                        assert.isUndefined(res.body.assigned_to);
                        assert.isUndefined(res.body.status_text);

                        done();
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
                    .end((err, res) => {
                        if (err) {
                            console.error(err);

                            assert.fail();

                            return done(err);
                        }

                        assert.ok(res);
                        assert.equal(res.status, 200);
                        assert.isEmpty(res.body);

                        done();
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
                    .end((err, res) => {
                        if (err) {
                            console.error(err);

                            assert.fail();

                            return done(err);
                        }

                        assert.ok(res);
                        assert.isNotEmpty(res.body);
                        assert.isArray(res.body);
                        assert.lengthOf(res.body, 3);

                        done();
                    });
            });

            it("View issues on a project with one filter: GET request to /api/issues/apitest", function (done) {
                chai.request(server)
                    .get("/api/issues/apitest")
                    .query({ created_by: "Abdelrahman" })
                    .end((err, res) => {
                        if (err) {
                            console.error(err);

                            assert.fail();

                            return done(err);
                        }

                        assert.ok(res);
                        assert.isNotEmpty(res.body);
                        assert.isArray(res.body);
                        assert.lengthOf(res.body, 2);

                        done();
                    });
            });

            it("View issues on a project with multiple filters: GET request to /api/issues/apitest", function (done) {
                chai.request(server)
                    .get("/api/issues/apitest")
                    .query({
                        created_by: "Abdelrahman",
                        assigned_to: "amsaid1989",
                    })
                    .end((err, res) => {
                        if (err) {
                            console.error(err);

                            assert.fail();

                            return done(err);
                        }

                        assert.ok(res);
                        assert.isNotEmpty(res.body);
                        assert.isArray(res.body);
                        assert.lengthOf(res.body, 1);

                        done();
                    });
            });
        });
    });
});
