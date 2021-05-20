const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    text: { type: String, required: true },
    creator: { type: String, required: true },
    assignee: { type: String },
    open: { type: Boolean, default: true },
    status: { type: String },
    created_on: { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },
});

module.exports = {
    issueSchema,
};
