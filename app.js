const path = require("path");
const express = require("express");
const db = require("./database/data2");
const { AsyncResource } = require("async_hooks");

const loginRoutes = require("./routes/login-authentication");
const clientPageRoutes = require("./routes/client-page");
const createAccountRoutes = require("./routes/create-account");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use(loginRoutes);
app.use(clientPageRoutes);
app.use(createAccountRoutes);

app.get("/client", (request, response) => {
   response.render("client-page");
});

// app.get("/create-account", (request, response) => {
//    response.render("register-page", { m1: "" });
// });

// app.post("/create-account", async (request, response) => {
//    const formData = request.body;
//    console.log(formData);
//    const currentCustomers = await db.query("select * from customer where email = ?", [
//       formData.useremail,
//    ]);
//    const admin = await db.query("select * from admin where email = ?", [
//       formData.useremail,
//    ]);
//    if (currentCustomers[0].length != 0 || admin[0].length != 0) {
//       return response.render("register-page", {
//          m1: "email already exist, choose a different one.",
//       });
//    }
//    if (formData.userpassword1 != formData.userpassword2) {
//       return response.render("register-page", { m1: "passwords do not match" });
//    }
//    await db.query(
//       "insert into customer(name,email,password,balance,loan) value(?,?,?,?,?)",
//       [formData.username, formData.useremail, formData.userpassword1, 0, 0]
//    );
//    response.send(
//       `<h3 style="text-align:center;">Account created, click <a href="/">here</a> to login.</h3>`
//    );
// });

app.get("/admin-home/:id", async (request, response) => {
   const data = await db.query("select * from admin where id = ?", [request.params.id]);
   response.render("admin-home", { adminData: data[0][0] });
});

app.get("/admin/:id/transfer", async (request, response) => {
   const data = await db.query("select * from transfer");
   response.render("transfer-request", { data: data[0], admin: request.params.id });
});
app.get("/admin/:id/deposit", async (request, response) => {
   const data = await db.query("select * from deposit");
   response.render("deposit-request", {
      data: data[0],
      admin: parseInt(request.params.id),
   });
});
app.get("/admin/:id/withdraw", async (request, response) => {
   const data = await db.query("select * from withdraw");
   response.render("withdraw-request", {
      data: data[0],
      admin: parseInt(request.params.id),
   });
});
app.get("/admin/:id/loan", async (request, response) => {
   const data = await db.query("select * from loan");
   console.log(data);
   response.render("loan-request", { data: data[0], admin: parseInt(request.params.id) });
});

app.post("/transfer/:id/accept", async (request, response) => {
   const transferData = await db.query("select * from transfer where id = ?", [
      request.params.id,
   ]);
   const senderBalance = await db.query(
      "select balance from customer where account_no = ?",
      [transferData[0][0].sender]
   );
   const receiverBalance = await db.query(
      "select balance from customer where account_no = ?",
      [transferData[0][0].receiver]
   );
   await db.query("update customer set balance = ? where account_no = ? ", [
      senderBalance[0][0].balance - transferData[0][0].amount,
      transferData[0][0].sender,
   ]);
   await db.query("update customer set balance = ? where account_no = ? ", [
      receiverBalance[0][0].balance + transferData[0][0].amount,
      transferData[0][0].receiver,
   ]);
   await db.query("delete from transfer where id = ?", [request.params.id]);
   await db.query("insert into message_box(id, message) values(?,?)", [
      transferData[0][0].sender,
      `Transaction amount ${transferData[0][0].amount} was successfully sent to ${transferData[0][0].receiver}`,
   ]);
   await db.query("insert into message_box(id, message) values(?,?)", [
      transferData[0][0].receiver,
      `Transaction amount ${transferData[0][0].amount} was successfully deposited in your account from ${transferData[0][0].sender}`,
   ]);
   response.redirect(`/admin/${transferData[0][0].admin_id}/transfer`);
});

app.post("/transfer/:id/reject", async (request, response) => {
   const transferData = await db.query("select * from transfer where id = ?", [
      request.params.id,
   ]);
   await db.query("delete from transfer where id = ?", [request.params.id]);
   await db.query("insert into message_box(id, message) values(?,?)", [
      transferData[0][0].sender,
      `Apologies. Transaction amount of${transferData[0][0].amount} to ${transferData[0][0].receiver} was unsuccessful`,
   ]);
   response.redirect(`/admin/${transferData[0][0].admin_id}/transfer`);
});

app.post("/deposit/:id/accept", async (request, response) => {
   const depositData = await db.query("select * from deposit where id = ?", [
      request.params.id,
   ]);
   const customerData = await db.query(
      "select name,balance from customer where account_no = ?",
      [depositData[0][0].account]
   );
   const adminData = await db.query("select * from admin where id = ?", [
      depositData[0][0].admin_id,
   ]);
   await db.query("update admin set total_bank_deposits = ? where id = ?", [
      adminData[0][0].total_bank_deposits + depositData[0][0].amount,
      adminData[0][0].id,
   ]);
   await db.query("update customer set balance = ? where account_no = ? ", [
      customerData[0][0].balance + depositData[0][0].amount,
      depositData[0][0].account,
   ]);
   await db.query("delete from deposit where id = ?", [request.params.id]);
   await db.query("insert into message_box(id, message) values(?,?)", [
      depositData[0][0].account,
      `Dear ${customerData[0][0].name}, amount ${depositData[0][0].amount} was successfully deposited into your account`,
   ]);
   response.redirect(`/admin/${depositData[0][0].admin_id}/deposit`);
});

app.post("/loan/:id/accept", async (request, response) => {
   const loanData = await db.query("select * from loan where id = ?", [
      request.params.id,
   ]);
   const customerData = await db.query(
      "select name,loan from customer where account_no = ?",
      [loanData[0][0].account]
   );
   const adminData = await db.query("select * from admin where id = ?", [
      loanData[0][0].admin_id,
   ]);
   await db.query("update admin set total_lent_amount = ? where id = ?", [
      adminData[0][0].total_lent_amount + loanData[0][0].amount,
      adminData[0][0].id,
   ]);
   await db.query("update customer set loan = ? where account_no = ? ", [
      customerData[0][0].loan + loanData[0][0].amount,
      loanData[0][0].account,
   ]);
   await db.query("delete from loan where id = ?", [request.params.id]);
   await db.query("insert into message_box(id, message) values(?,?)", [
      loanData[0][0].account,
      `Dear ${customerData[0][0].name}, loan of ${loanData[0][0].amount} was successfully debited into your account`,
   ]);
   response.redirect(`/admin/${loanData[0][0].admin_id}/loan`);
});

app.post("/loan/:id/reject", async (request, response) => {
   const loanData = await db.query("select * from loan where id = ?", [
      request.params.id,
   ]);
   await db.query("delete from loan where id = ?", [request.params.id]);
   await db.query("insert into message_box(id, message) values(?,?)", [
      loanData[0][0].account,
      `Dear user,your request of lending ${loanData[0][0].amount} was not accepted.`,
   ]);
   response.redirect(`/admin/${loanData[0][0].admin_id}/loan`);
});

app.post("/withdraw/:id/accept", async (request, response) => {
   const withdrawData = await db.query("select * from withdraw where id = ?", [
      request.params.id,
   ]);
   const customerData = await db.query(
      "select name,balance from customer where account_no = ?",
      [withdrawData[0][0].account]
   );
   const adminData = await db.query("select * from admin where id = ?", [
      withdrawData[0][0].admin_id,
   ]);
   await db.query("update admin set total_bank_deposits = ? where id = ?", [
      adminData[0][0].total_bank_deposits - withdrawData[0][0].amount,
      adminData[0][0].id,
   ]);
   await db.query("update customer set balance = ? where account_no = ? ", [
      customerData[0][0].balance - withdrawData[0][0].amount,
      withdrawData[0][0].account,
   ]);
   await db.query("delete from withdraw where id = ?", [request.params.id]);
   // here id in message_box is account_no , so dont get confused lmao.
   await db.query("insert into message_box(id, message) values(?,?)", [
      withdrawData[0][0].account,
      `Dear ${customerData[0][0].name}, Your withdraw request${withdrawData[0][0].amount} was successful, please collect the cash`,
   ]);
   response.redirect(`/admin/${withdrawData[0][0].admin_id}/withdraw`);
});

app.post("/withdraw/:id/reject", async (request, response) => {
   const withdrawData = await db.query("select * from withdraw where id = ?", [
      request.params.id,
   ]);
   await db.query("delete from withdraw where id = ?", [request.params.id]);
   await db.query("insert into message_box(id, message) values(?,?)", [
      withdrawData[0][0].account,
      `Dear user,your request of withdrawing ${withdrawData[0][0].amount} was not accepted.`,
   ]);
   response.redirect(`/admin/${withdrawData[0][0].admin_id}/withdraw`);
});

app.get("/client/message/:id", async (request, response) => {
   const messageData = await db.query("select * from message_box where id = ?", [
      request.params.id,
   ]);
   // dont ask why i am sending 1d array thas cuz i got a whole lotta messages aight ?
   response.render("message-box", {
      messageData: messageData[0],
      account_no: request.params.id,
   });
});

app.post("/client/message/:id/delete", async (request, response) => {
   await db.query("delete from message_box where serial = ?", [request.params.id]);
   response.redirect(`/client/message/${request.body.account_no}`);
});

//lol this is the middle.
app.use((request, response) => {
   response.status(500).send("<h1>404 web page not found!</h1>");
});
app.use((error, request, response, next) => {
   response.send("<h1>Sorry some server issue!</h1>");
});

app.listen(3000, () => {
   console.log("server initiated.");
});
