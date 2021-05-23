process.env.NODE_ENV = "test";

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

describe("Functional Tests", function () {});
