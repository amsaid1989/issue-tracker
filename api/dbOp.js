const { Issue } = require("./models");

module.exports = {
    addIssue: function (issueObj) {
        const doc = new Issue({
            title: issueObj.title,
            text: issueObj.text,
            creator: issueObj.creator,
            project: issueObj.project,
            assignee: issueObj.assignee,
            status: issueObj.status,
        });

        return doc.save();
    },

    updateIssue: function (id, updateObj) {
        return Issue.findById(id)
            .then((issue) => {
                const keys = Object.keys(updateObj);

                // TODO: surely there is a better way to do this
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];

                    issue[key] = updateObj[key];
                }

                return issue.save();
            })
            .catch((err) => {
                throw err;
            });
    },
};
