const express = require("express");
const db = require("../database/data2");

const router = express.Router();

router.post("/withdraw/:id/accept", async (request, response) => {
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
      `Dear ${customerData[0][0].name}, Your withdraw request${withdrawData[0][0].amount} AED was successful, please collect the cash`,
   ]);
   response.redirect(`/admin/${withdrawData[0][0].admin_id}/withdraw`);
});

router.post("/withdraw/:id/reject", async (request, response) => {
   const withdrawData = await db.query("select * from withdraw where id = ?", [
      request.params.id,
   ]);
   await db.query("delete from withdraw where id = ?", [request.params.id]);
   await db.query("insert into message_box(id, message) values(?,?)", [
      withdrawData[0][0].account,
      `Dear user,your request of withdrawing ${withdrawData[0][0].amount} AED was not accepted.`,
   ]);
   response.redirect(`/admin/${withdrawData[0][0].admin_id}/withdraw`);
});

module.exports = router;
