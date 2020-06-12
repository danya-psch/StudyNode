const express = require("express");
const consolidate = require('consolidate');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('./routes/auth').passport;
// const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const Node = require("./models/node");

const Telegram = require("./modules/telegram");

const connectOptions = { useNewUrlParser: true };

const app = express();

app.engine('html', consolidate.ejs);
app.set('views', path.join(__dirname, 'views'));
app.set('public', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');

app.use(logger('tiny'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({
	secret: "secret",
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
	res.locals.user = req.user;
	next();
});

const usersRouter = require('./routes/users');
app.use("/users", usersRouter);

const tasksRouter = require('./routes/tasks');
app.use("/tasks", tasksRouter);

const coursesRouter = require('./routes/courses');
app.use("/courses", coursesRouter);

const authRouter = require('./routes/auth').router;
app.use("/auth", authRouter);

const nodesRouter = require('./routes/nodes');
app.use("/nodes", nodesRouter);

const decisionRouter = require('./routes/decision');
app.use("/decision", decisionRouter);

const developerRouter = require('./routes/developer');
app.use("/developer/v1", developerRouter);

const apiRouter = require('./routes/api');
app.use("/api/v1", apiRouter);

const config = require('./config');

const databaseUrl = config.DatabaseUrl;
const serverPort = config.ServerPort;

app.get("/", (req, res) => {
	res.render("index", { page_name : "index", user : req.user});
});

app.get("/about", (req, res) => {
	// res.render("about", { page_name : "about" });
	res.render("about");
});

// app.get("/webgl", (req, res) => {
// 	res.render("webgl", { page_name : "about" });
// });

// app.get("/webgl2", (req, res) => {
// 	res.render("webgl2", { page_name : "about" });
// });

app.get("/webgl/get", (req, res) => {
	Node.getAll()
	.then(items => {
		res.send({ nodes : items });
	})
	.catch(err => console.log(err));
});

mongoose.connect(databaseUrl, connectOptions)
	.then(() => console.log(`Database connected: ${databaseUrl}`))
	.then(() => app.listen(serverPort, () => console.log(`Server started: ${serverPort}`)))
	.catch(err => console.log(err));
