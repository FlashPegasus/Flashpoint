const https = require('https');
const fs = require('fs');
const path = require('path');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const filePath = path.join(__dirname, '../public/flashpoint-shield.png');

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

const fileBuf = fs.readFileSync(filePath);

const payload = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n`),
    Buffer.from('5265494dff93bcf85675e2f75a9d6820'),
    Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="type"\r\n\r\n`),
    Buffer.from('image'),
    Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="action"\r\n\r\n`),
    Buffer.from('upload'),
    Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="flashpoint-shield.png"\r\nContent-Type: image/png\r\n\r\n`),
    fileBuf,
    Buffer.from(`\r\n--${boundary}--`)
]);

const options = {
    hostname: 'postimages.org',
    path: '/json',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
};

const req = https.request(options, (res) => {
    let rawData = '';
    res.on('data', (d) => { rawData += d; });
    res.on('end', () => {
        try {
            const result = JSON.parse(rawData);
            if (result && result.url) {
                console.log('\n--- UPLOAD SUCCESSFUL ---');
                console.log('DIRECT URL:', result.url);
            } else {
                console.log(result);
            }
        } catch(e) { console.error('Failed to parse:', rawData); }
    });
});

req.on('error', (e) => console.error(e));
req.write(payload);
req.end();
