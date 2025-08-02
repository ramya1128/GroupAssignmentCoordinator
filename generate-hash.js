// generate-hash.js
/*const bcrypt = require('bcryptjs');

const password = 'admin123';

bcrypt.hash(password, 10).then(hash => {
  console.log('Hashed Password:', hash);
});*/

const bcrypt = require("bcryptjs");

(async () => {
  const hash = await bcrypt.hash("ramya@123", 10);
  console.log(hash);
})();