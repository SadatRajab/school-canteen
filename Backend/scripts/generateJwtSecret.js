const crypto = require('crypto');

// Generate a secure random JWT secret
const secret = crypto.randomBytes(32).toString('hex');

console.log('═══════════════════════════════════════════════════');
console.log('  School Canteen - JWT Secret Generator  ');
console.log('═══════════════════════════════════════════════════\n');
console.log('✅ Secure JWT secret generated!\n');
console.log('Copy this to your .env file:');
console.log('═══════════════════════════════════════════════════\n');
console.log(`JWT_SECRET=${secret}\n`);
console.log('═══════════════════════════════════════════════════');
console.log('⚠️  Keep this secret secure and never commit it to git!');
console.log('═══════════════════════════════════════════════════\n');
