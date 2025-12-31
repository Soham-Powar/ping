const express = require("express");
const path = require("node:path");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

//update database url
//create data models in prisma schema

//run prisma migrate dev --name init
// it will create database tables based on schema

//generate prisma client
// npx prisma generate

//then the lib /prisma.js can be used to interact with the database
