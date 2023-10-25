const express = require("express");
const db = require("../database/data2");

const router = express.Router();

router.get("/client-page/:id", async (request, response) => {
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

router.post("/client/:id/transfer", async (request, response) => {
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

router.post("/client/:id/deposit", async (request, response) => {
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

router.post("/client/:id/withdraw", async (request, response) => {
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

router.post("/client/:id/loan", async (request, response) => {
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

module.exports = router;
