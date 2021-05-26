require("dotenv").config();
const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const { Issue } = require("./models");

function getURI() {
    return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV === "test") {
            const memoryServer = new MongoMemoryServer();

            memoryServer.getUri().then((MONGO_URI) => {
                resolve(MONGO_URI);
            });
        } else {
            resolve(process.env.MONGO_URI);
        }
    });
}

module.exports = {
    connect: function () {
        return getURI().then((URI) => {
            return mongoose.connect(URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
            });
        });
    },

    addIssue: function (issueObj) {
        const doc = new Issue({
            issue_title: issueObj.issue_title,
            issue_text: issueObj.issue_text,
            created_by: issueObj.created_by,
            project: issueObj.project,
            assigned_to: issueObj.assigned_to || "",
            status_text: issueObj.status_text || "",
        });

        return doc.save();
    },

    getIssue: function (id) {
        return Issue.findById(id).exec();
    },

    findIssues: function (searchObj) {
        return Issue.find(searchObj)
            .select(
                "assigned_to status_text open _id issue_title issue_text created_by created_on updated_on"
            )
            .exec();
    },

    updateIssue: function (id, updateObj) {
        return this.getIssue(id)
            .then((issue) => {
                issue.set(updateObj);

                return issue.save();
            })
            .catch((err) => {
                throw err;
            });
    },

    removeIssue: function (id) {
        return Issue.deleteOne({ _id: id });
    },
};
