const bcrypt = require('bcryptjs');

const passwords = ['shine123', 'aqua2026', 'wash2026'];
const hashes = [
    '$2a$10$xfDTZWDmFgjEL/ZPFaGi.OlnHexLR.v4OeIyK0vGIaXBsaAmNH/zy', // manager
    '$2a$10$mJqkdp55OFlVAInNeFwvku3pKC.FtyX7HJT.BOnz0rBJVpbGGHWzm', // staff01/02
    '$2a$10$W7./OAuCb7lAK7bRp6VKveIkBIrFUBUMrfbvVHdJL.6B99pE/1qlS', // alex
];

async function run() {
    for (let i = 0; i < passwords.length; i++) {
        const match = await bcrypt.compare(passwords[i], hashes[i]);
        console.log(`Password: ${passwords[i]}, Hash: ${hashes[i]}, Match: ${match}`);
        if (!match) {
            const newHash = await bcrypt.hash(passwords[i], 10);
            console.log(`  New suggested hash for ${passwords[i]}: ${newHash}`);
        }
    }
}

run();
