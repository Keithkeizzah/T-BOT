const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

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
      // Ensure cache directory exists
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const apiUrl = `https://apis-keith.vercel.app/download/spotify?q=${encodeURIComponent(searchTerm)}`;
      const response = await axios.get(apiUrl);

      if (!response.data.status || !response.data.result) {
        return bot.sendMessage(chatId, "No results found for your query.");
      }

      const { title, downloadLink } = response.data.result;
      const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      const filePath = path.join(cacheDir, fileName);

      const downloadResponse = await axios({
        method: 'get',
        url: downloadLink,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filePath);
      downloadResponse.data.pipe(writer);

      writer.on('finish', async () => {
        try {
          await bot.sendAudio(chatId, fs.createReadStream(filePath), { 
            title: title,
            performer: "Spotify"
          });
        } catch (sendError) {
          console.error('Error sending audio:', sendError);
          await bot.sendMessage(chatId, 'Error sending the audio file.');
        } finally {
          // Clean up after sending
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });

      writer.on('error', (err) => {
        console.error('Error writing file:', err);
        bot.sendMessage(chatId, 'An error occurred while saving the audio file.');
      });

    } catch (error) {
      console.error('[ERROR]', error);
      bot.sendMessage(chatId, 'An error occurred while processing the command.');
    } finally {
      await bot.deleteMessage(chatId, searchMessage.message_id);
    }
  }
};
