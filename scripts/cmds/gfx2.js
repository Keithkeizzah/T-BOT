const axios = require('axios');

module.exports = {
    config: {
        name: "gfx2",
        author: "keithkeizzah",
        description: "Send an image ",
        category: "gfx",
        usage: "<prompt>",
        usePrefix: true
    },

    onStart: async function ({ bot, chatId, args }) {
        const prompt = args.join(' ');
        if (!prompt) {
            bot.sendMessage(chatId, "Please provide a prompt.");
            return;
        }

        try {
            const apiUrl = `https://samirxpikachuio.onrender.com/gfx2?name=${encodeURIComponent(prompt)}`;
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            const imageData = Buffer.from(response.data, 'binary');
            await bot.sendPhoto(chatId, imageData);
        } catch (error) {
            console.error('Error sending image:', error);
            bot.sendMessage(chatId, 'Sorry, an error occurred while sending the image.');
        }
    }
};
