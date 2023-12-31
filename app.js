const path = require("path");
const express = require("express");
const db = require("./database/data2");
const { AsyncResource } = require("async_hooks");

const loginRoutes = require("./routes/login-authentication");
const clientPageRoutes = require("./routes/client-page");
const clientMessagesRoutes = require("./routes/client-message-routing");
const createAccountRoutes = require("./routes/create-account");
const adminPageRoutes = require("./routes/admin-page");
const transferOperationRoutes = require("./routes/transfer-operation");
const depositOperationRoutes = require("./routes/deposit-operation");
const withdrawOperationRoutes = require("./routes/withdraw-operation");
const loanOperationRoutes = require("./routes/loan-operation");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use(loginRoutes);
app.use(clientPageRoutes);
app.use(clientMessagesRoutes);
app.use(createAccountRoutes);
app.use(adminPageRoutes);
app.use(transferOperationRoutes);
app.use(depositOperationRoutes);
app.use(withdrawOperationRoutes);
app.use(loanOperationRoutes);

app.get("/client", (request, response) => {
   response.render("client-page");
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
