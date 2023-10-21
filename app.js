const path = require("path");
const express = require("express");
const db = require("./database/data2");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/", (request, response) => {
   response.render("index", { message: "" });
});

app.post("/login", async (request, response) => {
   const loginData = request.body;

   if (loginData.userselection == "admin") {
      const data = await db.query("select * from admin where email = ?", [loginData.useremail]);
      const adminData = data[0];
      if (adminData.length == 0) {
         response.render("index", { message: "No such Administrator exist." });
      } else if (adminData[0].password !== loginData.userpassword) {
         response.render("index", { message: "Incorrect password, please retry again." });
      } else {
         response.redirect(`/admin-home/${adminData[0].id}`);
      }
   } else {
      const data = await db.query("select * from customer where email = ?", [loginData.useremail]);
      const customerData = data[0];
      if (customerData.length == 0) {
         response.render("index", {
            message: "No such email exists, Create an account to login.",
         });
      } else if (customerData[0].password != loginData.userpassword) {
         response.render("index", { message: "Incorrect password, please retry again." });
      } else {
         response.redirect(`/client-page/${customerData[0].account_no}`);
      }
   }
});

app.get("/client", (request, response) => {
   response.render("client-page");
});

app.get("/create-account", (request, response) => {
   response.render("register-page");
});

app.get("/admin-home/:id", async (request, response) => {
   const data = await db.query("select * from admin where id = ?", [request.params.id]);
   const adminData = data[0];
   response.render("admin-home", { adminData: adminData[0] });
});

app.get("/client-page/:id", async (request, response) => {
   const data = await db.query("select * from customer where account_no = ?", [request.params.id]);
   const customerData = data[0];
   response.render("client-page", { customerData: customerData[0], m1: "", m2: "", m3: "", m4: "" });
});

app.post("/client-transfer/:id", async (request, response) => {
   const requestData = request.body;
   const senderData = await db.query("select * from customer where account_no = ?", [request.params.id]);
   const receiverData = await db.query("select * from customer where account_no = ?", [
      requestData.receivingaccount,
   ]);
   if (receiverData[0].length == 0) {
      return response.render("client-page", {
         customerData: senderData[0][0],
         m1: "No such account exist",
         m2: "",
         m3: "",
         m4: "",
      });
   }
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
