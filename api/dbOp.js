const { Issue } = require("./models");

module.exports = {
    addIssue: function (issueObj) {
        const doc = new Issue({
            issue_title: issueObj.issue_title,
            issue_text: issueObj.issue_text,
            created_by: issueObj.created_by,
            project: issueObj.project,
            assigned_to: issueObj.assigned_to,
            status_text: issueObj.status_text,
        });

        return doc.save();
    },

    getIssue: function (id) {
        return Issue.findById(id).exec();
    },

    findIssues: function (searchObj) {
        return Issue.find(searchObj).exec();
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
