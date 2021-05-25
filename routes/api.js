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

            dbOp.addIssue(issue)
                .then((doc) => {
                    res.json({
                        _id: doc["_id"],
                        issue_title: doc["issue_title"],
                        issue_text: doc["issue_text"],
                        created_by: doc["created_by"],
                        open: doc["open"],
                        assigned_to: doc["assigned_to"],
                        status_text: doc["status_text"],
                        created_on: doc["created_on"],
                        updated_on: doc["updated_on"],
                    });
                })
                .catch((err) => {
                    res.send(`Error adding issue to the database: ${err}`);
                });
        })

        .put(function (req, res) {
            let project = req.params.project;
        })

        .delete(function (req, res) {
            let project = req.params.project;
        });
};
