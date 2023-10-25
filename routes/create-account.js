const express = require("express");
const db = require("../database/data2");

const router = express.Router();

router.get("/create-account", (request, response) => {
   response.render("register-page", { m1: "" });
});

router.post("/create-account", async (request, response) => {
   const formData = request.body;
   console.log(formData);
   const currentCustomers = await db.query("select * from customer where email = ?", [
      formData.useremail,
   ]);
   const admin = await db.query("select * from admin where email = ?", [
      formData.useremail,
   ]);
   // this is bascially checking if there is a user already.
   if (currentCustomers[0].length != 0 || admin[0].length != 0) {
      return response.render("register-page", {
         m1: "email already exist, choose a different one.",
      });
   }
   if (formData.userpassword1 != formData.userpassword2) {
      return response.render("register-page", { m1: "passwords do not match" });
   }
   await db.query(
      "insert into customer(name,email,password,balance,loan) value(?,?,?,?,?)",
      [formData.username, formData.useremail, formData.userpassword1, 0, 0]
   );
   response.send(
      `<h3 style="text-align:center;">Account created, click <a href="/">here</a> to login.</h3>`
   );
});

module.exports = router;
