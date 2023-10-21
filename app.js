const path = require("path");
const express = require("express");
const db = require("./database/data2");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/", (request, response) => {
   response.render("index");
});

app.post("/login", async (request, response) => {
   const loginData = request.body;
   try {
      const connection = await db.getConnection();
      // Execute your database queries here
      // Don't forget to release the connection when you're done
      connection.release();
   } catch (error) {
      console.error("Database connection error:", error);
      response.status(500).send("An error occurred while connecting to the database.");
   }
});

app.get("/create-account", (request, response) => {
   response.render("register-page");
});

// app.use((request, response) => {
//    response.status(500).send("<h1>404 web page not found!</h1>");
// });
// app.use((error, request, response, next) => {
//    response.send("<h1>Sorry some server issue!</h1>");
// });

app.listen(3000, () => {
   console.log("server initiated.");
});
