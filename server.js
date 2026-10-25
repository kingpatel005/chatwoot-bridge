const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Yahan apni actual details daal dena
const TYPEBOT_URL = 'https://bot.hubate.com/api/v1/typebots/sos-client-inquiry-ofle3ox/startChat';
const CHATWOOT_API = 'https://chatwoot.hubate.com/api/v1/accounts/1';
const CHATWOOT_TOKEN = 'VnrDLYCdrwp1zZmbmS8gkxoP';

app.post('/webhook', async (req, res) => {
    try {
        console.log("Webhook Received:", JSON.stringify(req.body, null, 2)); // Yeh line add kar do
        
        const event = req.body;
        // Sirf tab chale jab customer ka naya incoming message ho
        if (event.event === 'message_created' && event.message_type === 'incoming' && event.content) {
            const conversationId = event.conversation.id;
            const userMessage = event.content;

            // 1. Message ko Typebot ke paas bhejo
            const typebotResponse = await axios.post(TYPEBOT_URL, {
                message: userMessage
            });

            // 2. Typebot ke jawab ka text nikalo
            const botReply = typebotResponse.data.messages[0].text;

            // 3. Us jawab ko Chatwoot par wapas bhejo
            await axios.post(`${CHATWOOT_API}/conversations/${conversationId}/messages`, {
                content: botReply,
                message_type: 'outgoing'
            }, {
                headers: { api_access_token: CHATWOOT_TOKEN }
            });
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Error');
    }
});

app.listen(3000, () => {
    console.log('Bridge is running on port 3000');
});
