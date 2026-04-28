const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const express = require('express');
const app = express();
const port = 9500;
const VALID_KEY = "nusan789";

app.get('/game/:id', async (req, res) => {
    const steamId = req.params.id;
    const userKey = req.query.key;

    if (userKey !== VALID_KEY) return res.status(401).json({ error: "Unauthorized" });

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        let gameData = null;

        // Mendengarkan semua response dari Network
        page.on('response', async (response) => {
            const url = response.url();
            // Mencari request API yang mengandung steamId di namanya
            if (url.includes(`api/game-details/${steamId}`)) {
                try {
                    gameData = await response.json();
                    console.log(`[${new Date().toLocaleTimeString()}] Data tertangkap dari Network!`);
                } catch (e) {
                    // Kadang response bukan JSON, abaikan saja
                }
            }
        });

        // Buka halaman web utamanya, bukan API-nya
        await page.goto(`https://gamalytic.com/game/${steamId}`, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Tunggu maksimal 5 detik jika data belum tertangkap (antisipasi delay API)
        let retry = 0;
        while (!gameData && retry < 10) {
            await new Promise(r => setTimeout(r, 500));
            retry++;
        }

        if (gameData) {
            res.json(gameData);
        } else {
            res.status(404).json({ error: "Data tidak ditemukan di Network" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await browser.close();
    }
});

app.listen(port, () => console.log(`Server jalan di port ${port}`));