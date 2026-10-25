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
        const event = req.body;

        // Jab bhi customer naya message bheje
        if (event.event === 'message_created' && event.message_type === 'incoming' && event.content) {
            const conversationId = event.conversation.id;
            const userMessage = event.content;

            // 1. Message Typebot ko bhejo
            const typebotResponse = await axios.post(TYPEBOT_URL, {
                message: userMessage
            });

            // 2. Typebot ka jawab nikalo
            const botReply = typebotResponse.data.messages[0].text;

            // 3. Jawab wapas Chatwoot par bhej do
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Bridge running on port ${PORT}`);
});
