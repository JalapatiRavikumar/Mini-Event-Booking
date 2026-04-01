const crypto = require("crypto");

function generateBookingCode() {
  return `BKG-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
}

module.exports = {
  generateBookingCode
};
