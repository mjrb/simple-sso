const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");

let users = {
    dude: {password: "password", tokens: []}, 
    dave: {password: "lmao", tokens: []}
};
let nextToken = 0;

const app = express();

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
    secret: "super-secret",
    resave: false,
    saveUninitialized: true
//    cookie: {secure: true}
}));

app.all("/authorize", (req, res) => {
    if (req.query.redirect) {
	req.session.redirect = req.query.redirect;
    }
    if (req.query.get) {
	req.session.get = true;
    }

    console.log(req.session);
    let redirect = req.session.redirect;
    let get = req.session.get;
    
    if (req.session.loggedIn) {
	let token = nextToken;
	nextToken++;
	let username = req.session.username;
	users[username].tokens.push(token);

	if (!redirect) {
	    res.json({username, token});
	} else {
	    req.session.redirect = undefined;
	    req.session.get = undefined;
	    if (get) {
		res.redirect(redirect);
	    } else {
		res.render("redirect", {redirect, token, username});
	    }
	}
    } else {
	if (!redirect) {
	    res.status(401);
	    res.json({error: "login required"});
	} else {
	    res.redirect("/login.html");
	}
    }
});

app.post("/login", (req, res) => {
    if (!req.body.username || !req.body.password) {
	res.status(400);
	res.send("username and password required");
    }

    let username = req.body.username;
    let password = req.body.password;

    const fail = () => {
	res.status(401);
	res.send("bad username or password");
    }

    if (users[username] === undefined) {
	fail();
    } else if (users[username].password !== password) {
	fail();
    } else {
	req.session.loggedIn = true;
	req.session.username = username;
	console.log(req.session);
	res.redirect(307, "/authorize");
    }
    
});

app.get("/logout", (req, res) => {
    req.session.loggedIn = false;
    let username = req.session.username;
    if (username && users[username]) {
	users[username].tokens = [];
    } else {
	res.status(500);
	res.send("logout error");
    }
    res.send("successfully logged out");
});

app.post("/bodydump", (req, res) => {
    res.json(req.body);
});

app.listen(3000);
