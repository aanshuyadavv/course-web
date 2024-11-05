const mongoose = require("mongoose");
const dbgr = require("debug")("development:mongoose");
const config = require("config");

main()
  .then(dbgr("connected to db"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(`${config.get("MONGO_URI")}/sciastra`);
}

module.exports = main;
