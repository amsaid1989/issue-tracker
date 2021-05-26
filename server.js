"use strict";

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
process.env.NODE_ENV = "test";

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

const dbOp = require("./api/dbOp");

let app = express();
app.use("/public", express.static(process.cwd() + "/public"));
app.use(cors({ origin: "*" })); //For FCC testing purposes only

dbOp.connect()
    .then(() => {
        if (
            mongoose.connection["_connectionString"] === process.env.MONGO_URI
        ) {
            console.log("connected to DB successfully");
        }

        // Emit ready event which will be used to stop the functional tests
        // from executing until the app is ready
        app.emit("ready");

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        //Sample front-end
        app.route("/:project/").get(function (req, res) {
            res.sendFile(process.cwd() + "/views/issue.html");
        });

        //Index page (static HTML)
        app.route("/").get(function (req, res) {
            res.sendFile(process.cwd() + "/views/index.html");
        });

        //For FCC testing purposes
        fccTestingRoutes(app);

        //Routing for API
        apiRoutes(app);

        //404 Not Found Middleware
        app.use(function (req, res, next) {
            res.status(404).type("text").send("Not Found");
        });

        console.log("Running Tests...");
        setTimeout(function () {
            try {
                runner.run();
            } catch (e) {
                let error = e;
                console.log("Tests are not valid:");
                console.log(error);
            }
        }, 3500);
    })
    .catch((err) => {
        console.error(err);
    });

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port " + process.env.PORT);
    // if (process.env.NODE_ENV === "test") {
    //     console.log("Running Tests...");
    //     setTimeout(function () {
    //         try {
    //             runner.run();
    //         } catch (e) {
    //             let error = e;
    //             console.log("Tests are not valid:");
    //             console.log(error);
    //         }
    //     }, 3500);
    // }
});

module.exports = app; //for testing
