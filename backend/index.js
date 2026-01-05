require("dotenv").config();

const express = require("express");
const path = require("node:path");
const app = express();

const cors = require("cors");

// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const loginRouter = require("./routes/loginRouter");
const signupRouter = require("./routes/signupRouter");
const messageRouter = require("./routes/messageRouter");
const userRouter = require("./routes/userRouter");
const groupRouter = require("./routes/groupRouter");

app.use("/users", userRouter);
app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/messages", messageRouter);
app.use("/groups", groupRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const errorHandler = require("./errors/errorHandler");
app.use(errorHandler);

app.listen(3005, () => {
  console.log("Server is running");
});

//update database url
//create data models in prisma schema

//run prisma migrate dev --name init
// it will create database tables based on schema

//generate prisma client
// npx prisma generate

//then the lib /prisma.js can be used to interact with the database
