const path = require("path");
const express = require("express");
const db = require("./database/data2");
const { AsyncResource } = require("async_hooks");

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
      const data = await db.query("select * from admin where email = ?", [
         loginData.useremail,
      ]);
      const adminData = data[0];
      if (adminData.length == 0) {
         response.render("index", { message: "No such Administrator exist." });
      } else if (adminData[0].password !== loginData.userpassword) {
         response.render("index", { message: "Incorrect password, please retry again." });
      } else {
         response.redirect(`/admin-home/${adminData[0].id}`);
      }
   } else {
      const data = await db.query("select * from customer where email = ?", [
         loginData.useremail,
      ]);
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
   response.render("admin-home", { adminData: data[0][0] });
});

app.get("/client-page/:id", async (request, response) => {
   const data = await db.query("select * from customer where account_no = ?", [
      request.params.id,
   ]);
   const customerData = data[0];
   response.render("client-page", {
      customerData: customerData[0],
      m1: "",
      m2: "",
      m3: "",
      m4: "",
   });
});

app.post("/client/:id/transfer", async (request, response) => {
   const requestData = request.body;
   const senderData = await db.query("select * from customer where account_no = ?", [
      request.params.id,
   ]);
   const receiverData = await db.query("select * from customer where account_no = ?", [
      requestData.receiver,
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
   if (senderData[0][0].balance < parseInt(requestData.transferamount)) {
      return response.render("client-page", {
         customerData: senderData[0][0],
         m1: "Insufficient balance",
         m2: "",
         m3: "",
         m4: "",
      });
   }
   await db.query(
      "insert into transfer(sender, receiver, amount ,admin_id) values(?, ?, ?, ?)",
      [
         senderData[0][0].account_no,
         receiverData[0][0].account_no,
         requestData.transferamount,
         1,
      ]
   );
   response.redirect(`/client-page/${request.params.id}`);
});

app.post("/client/:id/deposit", async (request, response) => {
   const customerData = await db.query("select * from customer where account_no = ?", [
      request.params.id,
   ]);
   await db.query("insert into deposit(account, amount, admin_id) values(?,?,?)", [
      customerData[0][0].account_no,
      request.body.depositamount,
      1,
   ]);
   response.redirect(`/client-page/${request.params.id}`);
});

app.post("/client/:id/withdraw", async (request, response) => {
   const customerData = await db.query("select * from customer where account_no = ?", [
      request.params.id,
   ]);
   if (parseInt(request.body.withdrawamount) > customerData[0][0].balance) {
      return response.render("client-page", {
         customerData: customerData[0][0],
         m1: "",
         m2: "",
         m3: "Insufficient balance",
         m4: "",
      });
   }
   await db.query("insert into withdraw(account, amount, admin_id) values(?,?,?)", [
      customerData[0][0].account_no,
      request.body.withdrawamount,
      1,
   ]);
   response.redirect(`/client-page/${request.params.id}`);
});

app.post("/client/:id/loan", async (request, response) => {
   const customerData = await db.query("select * from customer where account_no = ?", [
      request.params.id,
   ]);
   await db.query("insert into loan(account, amount, admin_id) values(?,?,?)", [
      customerData[0][0].account_no,
      request.body.loanamount,
      1,
   ]);
   response.redirect(`/client-page/${request.params.id}`);
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
   const withdrawData = await db.query("select * from loan where id = ?", [
      request.params.id,
   ]);
   await db.query("delete from withdraw where id = ?", [request.params.id]);
   await db.query("insert into message_box(id, message) values(?,?)", [
      withdrawData[0][0].account,
      `Dear user,your request of withdrawing ${withdrawData[0][0].amount} was not accepted.`,
   ]);
   response.redirect(`/admin/${withdrawData[0][0].admin_id}/withdraw`);
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
