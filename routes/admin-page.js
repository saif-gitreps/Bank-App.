const express = require("express");
const db = require("../database/data2");

const router = express.Router();

router.get("/admin-home/:id", async (request, response) => {
   //Sending data to the admin view ejs to display admin and bank info.

   const data = await db.query("select * from admin where id = ?", [request.params.id]);
   response.render("admin-home", { adminData: data[0][0] });
});

// all these routes are self-explanatory, just loading the ejs pages.

router.get("/admin/:id/transfer", async (request, response) => {
   const data = await db.query("select * from transfer");
   response.render("transfer-request", { data: data[0], admin: request.params.id });
});
router.get("/admin/:id/deposit", async (request, response) => {
   const data = await db.query("select * from deposit");
   response.render("deposit-request", {
      data: data[0],
      admin: parseInt(request.params.id),
   });
});
router.get("/admin/:id/withdraw", async (request, response) => {
   const data = await db.query("select * from withdraw");
   response.render("withdraw-request", {
      data: data[0],
      admin: parseInt(request.params.id),
   });
});
router.get("/admin/:id/loan", async (request, response) => {
   const data = await db.query("select * from loan");
   console.log(data);
   response.render("loan-request", { data: data[0], admin: parseInt(request.params.id) });
});

module.exports = router;
