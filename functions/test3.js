
const Cryptr = require('cryptr');
const audit_key = "q9ub";
const cryptr = new Cryptr(audit_key);
 
const encryptedString = cryptr.encrypt('528458231681646617');
const decryptedString = cryptr.decrypt('5dd39057e12aca3f9429235e6494840bafe2b1e44f6988250c4e05585bfff75ef8ab');
 
console.log(encryptedString); // 5590fd6409be2494de0226f5d7
console.log(decryptedString); // bacon