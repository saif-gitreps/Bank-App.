const path = require("path");
const express = require("express");
const exp = require("constants");
const app = express();

app.set("view engines", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (request, response) => {
   response.render("index");
});

app.use((request, response) => {
   response.status(500).send("<h1>404 web page not found!</h1>");
});
app.use((error, request, response, next) => {
   response.send("<h1>Sorry some server issue!</h1>");
});

app.listen(3000, () => {
   console.log("server initiated.");
});
