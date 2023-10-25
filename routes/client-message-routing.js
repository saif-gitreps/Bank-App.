const express = require("express");
const db = require("../database/data2");

const router = express.Router();

router.get("/client/message/:id", async (request, response) => {
   const messageData = await db.query("select * from message_box where id = ?", [
      request.params.id,
   ]);
   // dont ask why i am sending 1D array thas cuz i got a whole lotta messages aight ?
   response.render("message-box", {
      messageData: messageData[0],
      account_no: request.params.id,
   });
});

router.post("/client/message/:id/delete", async (request, response) => {
   //So when i click delete a perticular message its serial number is in the :id.(Dynamic routes).
   await db.query("delete from message_box where serial = ?", [request.params.id]);
   response.redirect(`/client/message/${request.body.account_no}`);
});

module.exports = router;
