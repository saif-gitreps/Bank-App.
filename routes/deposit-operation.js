const express = require("express");
const db = require("../database/data2");

const router = express.Router();

router.post("/deposit/:id/accept", async (request, response) => {
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

module.exports = router;
