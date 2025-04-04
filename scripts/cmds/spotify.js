const axios = require("axios");

module.exports = {
  config: {
    name: "spotify",
    author: "keithkeizzah",
    description: "Download audio from Spotify",
    category: "audio",
    usage: "spotify [song name]",
    usePrefix: true
  },
  onStart: async ({ bot, chatId, args }) => {
    const searchTerm = args.join(" ");

    if (!searchTerm) {
      return bot.sendMessage(chatId, `Please provide a song name. Usage: /spotify [song name]`);
    }

    const searchMessage = await bot.sendMessage(chatId, `🔍 Searching for "${searchTerm}" on Spotify...`);

    try {
      const apiUrl = `https://apis-keith.vercel.app/download/spotify?q=${encodeURIComponent(searchTerm)}`;
      const response = await axios.get(apiUrl);

      if (!response.data.status || !response.data.result) {
        return bot.sendMessage(chatId, "No results found for your query.");
      }

      const { title, downloadLink } = response.data.result;
      
      // Stream the audio directly without saving to disk
      const audioStream = await axios({
        method: 'get',
        url: downloadLink,
        responseType: 'stream'
      });

      await bot.sendAudio(chatId, audioStream.data, {
        title: title,
        performer: "Spotify"
      });

    } catch (error) {
      console.error('[ERROR]', error);
      bot.sendMessage(chatId, 'An error occurred while processing the command.' + error );
    } finally {
      await bot.deleteMessage(chatId, searchMessage.message_id);
    }
  }
};
