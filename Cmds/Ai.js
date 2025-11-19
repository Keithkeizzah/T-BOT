
const { keith } = require('../commandHandler');
const axios = require('axios');

keith({
  pattern: "gpt",
  aliases: ["ai", "ask"],
  category: "ai",
  description: "Ask questions to AI",
  cooldown: 5
},

async (msg, bot, context) => {
  const { reply, q } = context;

  if (!q) {
    return await reply(`Please provide a question!\nExample: ${context.prefix}gpt What is JavaScript?`);
  }

  try {
    await bot.sendChatAction(context.chatId, 'typing');
    
    const apiUrl = `https://apiskeith.vercel.app/ai/gpt?q=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl, { timeout: 30000 });
    const data = response.data;

    if (data.status && data.result) {
      await reply(data.result);
    } else {
      await reply('Sorry, no response from AI service.');
    }

  } catch (error) {
    await reply('Error: Could not get AI response. Try again later.');
  }
});
