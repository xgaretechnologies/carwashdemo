const fetch = require('node-fetch');

async function testLogin() {
    const url = 'http://localhost:5003/api/auth/login';
    const credentials = {
        username: 'manager',
        password: 'shine123'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Body:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLogin();
