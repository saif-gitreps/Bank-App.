const express = require("express");
const db = require("../database/data2");

const router = express.Router();

router.post("/transfer/:id/accept", async (request, response) => {
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

router.post("/transfer/:id/reject", async (request, response) => {
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

module.exports = router;
