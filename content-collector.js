const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());


// Increase the limit for the request body size
app.use(express.json({ limit: '250mb' }));
app.use(bodyParser.json({ limit: '250mb' }));


const BASE_URL = 'http://content-simulator:3001/getcontet/';

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Body:', req.body);
    next();
});

app.post('/content-collector', async (req, res) => {
    const input = req.body;

    try {
        const promises = input.map(async (item) => {
            const { docId } = item.docInfo;
            console.log(`Fetching content for docId: ${docId}`);
            const response = await axios.get(`${BASE_URL}${docId}`);
            console.log(`Received content for docId: ${docId}`, response.data);
            item.docInfo.content = response.data.content;
            return item;
        });

        const results = await Promise.all(promises);
        res.json(results);
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
