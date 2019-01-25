const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const config = require("./config");

const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
    secret: "super-secret",
    resave: false,
    saveUninitialized: true,
}));

app.get("/", (req, res) => {
    if (!req.session.loggedIn) {
	res.redirect(config.provider+":"+config.port+"/authorize?redirect="+
		     config.resource+":"+config.port+"/login");
    } else {
	res.send("hello " + req.session.username + "! your token is " + req.session.token);
    }
});

app.post("/login", (req, res) => {
    if (!req.body.username || !req.body.token) {
	res.status(400);
	res.send("login malformed");
    } else {
	req.session.username = req.body.username;
	req.session.token = req.body.token;
	req.session.loggedIn = true;
	res.redirect("/");
    }
})

app.listen(3001);
