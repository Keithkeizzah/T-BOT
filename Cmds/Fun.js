
const { keith } = require('../commandHandler');
const axios = require('axios');

// Global variable to track if callback is set up
let callbackSetup = false;

// Callback handler setup
function setupCallbackHandler(bot) {
    bot.on('callback_query', async (callbackQuery) => {
        try {
            const data = JSON.parse(callbackQuery.data);
            
            // Only handle quote command callbacks
            if (data.command === 'quote') {
                await handleQuoteCallback(callbackQuery, bot);
            }
            
        } catch (error) {
            console.error('Quote callback error:', error);
        }
    });
}

// Callback handler function
async function handleQuoteCallback(callbackQuery, bot) {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    
    try {
        // Answer callback immediately
        await bot.answerCallbackQuery(callbackQuery.id, {
            text: '🔄 Loading new quote...'
        });

        await bot.sendChatAction(chatId, 'upload_audio');
        
        // Fetch new quote audio
        const response = await axios.get('https://apiskeith.vercel.app/quote/audio');
        const quoteData = response.data;

        if (quoteData.status && quoteData.result && quoteData.result.mp3) {
            const audioUrl = quoteData.result.mp3;
            const quotes = quoteData.result.data.filter(item => item.type === 'quote');
            const quoteText = quotes.map(q => q.text).join('\n\n');

            // Edit the message with new audio
            await bot.editMessageCaption(`💭 Random Quote Audio\n\n${quoteText}`, {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔁 More', callback_data: JSON.stringify({ command: 'quote', action: 'more' }) }]
                    ]
                }
            });

            // Send new audio
            await bot.sendAudio(chatId, audioUrl, {
                caption: `💭 Random Quote Audio\n\n${quoteText}`,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔁 More', callback_data: JSON.stringify({ command: 'quote', action: 'more' }) }]
                    ]
                }
            });

            // Delete the old message
            await bot.deleteMessage(chatId, messageId);

        } else {
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ Failed to load quote'
            });
        }

    } catch (error) {
        console.error('Quote callback error:', error);
        await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Failed to load more'
        });
    }
}

// Main command
keith({
    pattern: "quote",
    aliases: ["qaudio", "inspireaudio"],
    category: "fun",
    description: "Random quote audio",
    cooldown: 10
},

async (msg, bot, context) => {
    const { reply } = context;

    // Setup callback handler on first use
    if (!callbackSetup) {
        setupCallbackHandler(bot);
        callbackSetup = true;
    }

    try {
        await bot.sendChatAction(context.chatId, 'upload_audio');
        
        const response = await axios.get('https://apiskeith.vercel.app/quote/audio');
        const quoteData = response.data;

        if (quoteData.status && quoteData.result && quoteData.result.mp3) {
            const audioUrl = quoteData.result.mp3;
            const quotes = quoteData.result.data.filter(item => item.type === 'quote');
            const quoteText = quotes.map(q => q.text).join('\n\n');

            const buttons = [
                [
                    { text: '🔁 More', callback_data: JSON.stringify({ command: 'quote', action: 'more' }) }
                ]
            ];

            await bot.sendAudio(context.chatId, audioUrl, {
                caption: `💭 Random Quote Audio\n\n${quoteText}`,
                reply_markup: {
                    inline_keyboard: buttons
                }
            });

        } else {
            await reply('❌ Failed to fetch quote audio.');
        }

    } catch (error) {
        console.error('Quote error:', error);
        await reply('❌ Failed to fetch quote audio.');
    }
});
