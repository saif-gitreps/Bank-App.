const express = require("express");
const db = require("../database/data2");

const router = express.Router();

router.post("/loan/:id/accept", async (request, response) => {
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

router.post("/loan/:id/reject", async (request, response) => {
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

module.exports = router;
