const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('═══════════════════════════════════════════════════');
console.log('  School Canteen - Admin Password Hash Generator  ');
console.log('═══════════════════════════════════════════════════\n');

rl.question('Enter admin password: ', async (password) => {
    if (password.length < 8) {
        console.log('\n❌ Password must be at least 8 characters long!');
        rl.close();
        return;
    }

    console.log('\n⏳ Generating bcrypt hash...\n');

    try {
        const hash = await bcrypt.hash(password, 10);

        console.log('✅ Password hash generated successfully!\n');
        console.log('═══════════════════════════════════════════════════');
        console.log('Copy this hash to your .env file:');
        console.log('═══════════════════════════════════════════════════\n');
        console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
        console.log('═══════════════════════════════════════════════════');
        console.log('⚠️  Keep this hash secure and never commit it to git!');
        console.log('═══════════════════════════════════════════════════\n');
    } catch (error) {
        console.log('❌ Error generating hash:', error.message);
    }

    rl.close();
});
