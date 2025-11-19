
const { keith } = require('../commandHandler');
const axios = require('axios');

keith({
  pattern: "play",
  aliases: ["song", "music"],
  category: "download",
  description: "Download audio from YouTube",
  cooldown: 10
},

async (msg, bot, context) => {
  const { reply, q } = context;

  if (!q) {
    return await reply(`Please provide a song name!\nExample: ${context.prefix}play spectre`);
  }

  try {
    await bot.sendChatAction(context.chatId, 'typing');

    // Search for videos
    const searchUrl = `https://apiskeith.vercel.app/search/yts?query=${encodeURIComponent(q)}`;
    const searchResponse = await axios.get(searchUrl);
    const searchData = searchResponse.data;

    if (!searchData.status || !searchData.result || searchData.result.length === 0) {
      return await reply('No results found for your query.');
    }

    // Get the first result
    const video = searchData.result[0];
    
    await reply(`Downloading: ${video.title}`);
    await bot.sendChatAction(context.chatId, 'upload_audio');

    // Download audio
    const downloadUrl = `https://apiskeith.vercel.app/download/audio?url=${encodeURIComponent(video.url)}`;
    const downloadResponse = await axios.get(downloadUrl);
    const downloadData = downloadResponse.data;

    if (downloadData.status && downloadData.result) {
      await bot.sendAudio(context.chatId, downloadData.result, {
        title: video.title,
        caption: `🎵 ${video.title}\n⏱️ ${video.duration}\n👁️ ${video.views}`
      });
    } else {
      await reply('Failed to download audio.');
    }

  } catch (error) {
    await reply('Error downloading audio. Try again later.');
  }
});
