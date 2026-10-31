// Officers are not self-registered. Create one from the command line:
// npm run seed:officer -- --username officer1 --password '...' --mobile 9876543210 --aadhar 123412341234
require("dotenv").config();
const { createUser } = require("../models/userModel");
const { validateRegistration } = require("../utils/validate");
const db = require("../utils/db");

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : undefined; };
const input = { username: arg("username"), password: arg("password"), mobile: arg("mobile"), aadhar: arg("aadhar") };

(async () => {
  const errors = validateRegistration(input);
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  const id = await createUser({ ...input, type: "Officer" });
  console.log(`Created officer ${input.username} (id ${id}).`);
  await db.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
