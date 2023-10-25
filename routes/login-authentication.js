const express = require("express");
const db = require("../database/data2");

const router = express.Router();

router.get("/", (request, response) => {
   response.render("index", { message: "" });
});

router.post("/login", async (request, response) => {
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

module.exports = router;
