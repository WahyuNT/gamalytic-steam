const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const port = 9500;

const VALID_KEY = "nusan789";

// Middleware CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/game/:id', async (req, res) => {
    const steamId = req.params.id;
    const userKey = req.query.key; // Mengambil key dari URL parameter

    // Cek Key
    if (userKey !== VALID_KEY) {
        console.warn(`[${new Date().toLocaleTimeString()}] Akses ditolak! Key salah untuk ID: ${steamId}`);
        return res.status(401).json({ error: "Unauthorized: Invalid API Key" });
    }

    console.log(`[${new Date().toLocaleTimeString()}] Menarik data: ${steamId}`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Bypass Vercel Checkpoint
        await page.goto(`https://gamalytic.com/api/game-details/${steamId}`, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        const content = await page.evaluate(() => document.body.innerText);
        const jsonData = JSON.parse(content);

        res.json(jsonData);
    } catch (error) {
        console.error("Error Puppeteer:", error.message);
        res.status(500).json({ error: "Gagal mengambil data", detail: error.message });
    } finally {
        await browser.close();
    }
});

app.listen(port, () => {
    console.log(`Puppeteer API aktif di port ${port}`);
});