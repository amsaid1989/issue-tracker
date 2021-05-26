const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use("/", express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "test.html"));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.put("/", (req, res) => {
    res.json(req.body);
});

app.listen(3000, function () {
    console.log("app listening on port 3000");
});
