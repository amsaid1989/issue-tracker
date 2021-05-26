"use strict";

const dbOp = require("../api/dbOp");

module.exports = function (app) {
    app.route("/api/issues/:project")
        .get(function (req, res) {
            const project = req.params.project;

            dbOp.findIssues({ project, ...req.query })
                .then((docs) => {
                    res.json(docs);
                })
                .catch((err) => {
                    res.send(`Error finding issues: ${err}`);
                });
        })

        .post(function (req, res) {
            const project = req.params.project;
            const issue = { ...req.body, project, open: true };

            if (
                !req.body.issue_title ||
                !req.body.issue_text ||
                !req.body.created_by
            ) {
                res.json({ error: "required field(s) missing" });
            } else {
                dbOp.addIssue(issue)
                    .then((doc) => {
                        res.json({
                            assigned_to: doc["assigned_to"],
                            status_text: doc["status_text"],
                            open: doc["open"],
                            _id: doc["_id"],
                            issue_title: doc["issue_title"],
                            issue_text: doc["issue_text"],
                            created_by: doc["created_by"],
                            created_on: doc["created_on"],
                            updated_on: doc["updated_on"],
                        });
                    })
                    .catch((err) => {
                        res.send(`Error adding issue to the database: ${err}`);
                    });
            }
        })

        .put(function (req, res) {
            const project = req.params.project;

            const id = req.body["_id"];
            const updateFieldCount = Object.keys(req.body).filter(
                (key) => key !== "_id"
            ).length;

            if (!id) {
                res.json({
                    error: "missing _id",
                });
            } else if (updateFieldCount === 0) {
                res.json({
                    error: "no update field(s) sent",
                    _id: req.body["_id"],
                });
            } else {
                let updateObj = {};

                for (let key of Object.keys(req.body)) {
                    if (key !== "_id") {
                        updateObj[key] = req.body[key];
                    }
                }

                dbOp.updateIssue(id, updateObj)
                    .then((doc) => {
                        res.json({
                            result: "successfully updated",
                            _id: doc["_id"],
                        });
                    })
                    .catch(() => {
                        res.json({
                            error: "could not update",
                            _id: id,
                        });
                    });
            }
        })

        .delete(function (req, res) {
            const project = req.params.project;

            const id = req.body["_id"];

            if (!id) {
                res.json({ error: "missing _id" });
            } else {
                dbOp.removeIssue(id)
                    .then((response) => {
                        if (response.deletedCount === 1) {
                            res.json({
                                result: "successfully deleted",
                                _id: id,
                            });
                        } else {
                            res.json({
                                error: "could not delete",
                                _id: id,
                            });
                        }
                    })
                    .catch((err) => {
                        res.json({
                            error: "could not delete",
                            _id: id,
                        });
                    });
            }
        });
};
