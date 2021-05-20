const mongoose = require("mongoose");
const { issueSchema } = require("./schemas");

const Issue = mongoose.model("Issue", issueSchema);

module.exports = {
    Issue,
};
