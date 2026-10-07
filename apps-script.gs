/* ============================================================
   Google Sheet contact-form backend
   ------------------------------------------------------------
   1. Create a new Google Sheet (sheet.new)
   2. Extensions > Apps Script
   3. Delete any code there, paste this file, Save
   4. Deploy > New deployment > Type: Web app
        - Execute as: Me
        - Who has access: Anyone
   5. Copy the Web app URL and paste it into script.js (SCRIPT_URL)
   ============================================================ */

function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Messages") ||
              SpreadsheetApp.getActiveSpreadsheet().insertSheet("Messages");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Received at", "Name", "Email", "Subject", "Message"]);
  }

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.email || "",
    data.subject || "",
    data.message || ""
  ]);

  // Optional: email you on every submission
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: "Portfolio contact: " + (data.subject || "New message"),
    body: "From: " + data.name + " <" + data.email + ">\n\n" + data.message
  });

  return ContentService
    .createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
