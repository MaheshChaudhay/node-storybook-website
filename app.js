const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const passport = require("passport");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { engine } = require("express-handlebars");
const connectDB = require("./config/db");
const {
  formatDate,
  editIcon,
  stripTags,
  select,
  truncate,
} = require("./helpers/hbs");

// load config
dotenv.config({ path: "./config/config.env" });

connectDB();

// config passport

require("./config/passport")(passport);

// config app

const app = express();
const port = process.env.PORT || 3000;

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.static(path.join(__dirname, "public")));

app.engine(
  ".hbs",
  engine({
    helpers: { formatDate, editIcon, stripTags, select, truncate },
    extname: ".hbs",
    defaultLayout: "main",
  })
);
app.set("view enigine", ".hbs");

app.use(
  session({
    secret: "storybook secret key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// api routes

app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

// listen

app.listen(port, () => {
  console.log(
    `server running in ${process.env.NODE_ENV} mode on port : ${port}`
  );
});
