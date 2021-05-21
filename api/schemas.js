const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        text: { type: String, required: true },
        creator: { type: String, required: true },
        project: { type: String, required: true },
        assignee: { type: String },
        open: { type: Boolean, default: true },
        status: { type: String },
    },
    { timestamps: { createdAt: "created_on", updatedAt: "updated_on" } }
);

module.exports = {
    issueSchema,
};
