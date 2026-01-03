
const { keith } = require('../commandHandler');
const axios = require('axios');
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================



keith({
  pattern: "apk",
  aliases: ["app", "aptoide"],
  category: "download",
  description: "Download APKs from Aptoide",
  cooldown: 10
},

async (msg, bot, context) => {
  const { reply, q } = context;

  if (!q) {
    return await reply(`Please provide an app name!\nExample: ${context.prefix}apk xender`);
  }

  try {
    await bot.sendChatAction(context.chatId, 'typing');

    // Search Aptoide API
    const searchUrl = `https://apiskeith.vercel.app/search/aptoide?q=${encodeURIComponent(q)}`;
    const searchResponse = await axios.get(searchUrl, { timeout: 30000 });
    const searchData = searchResponse.data;

    if (!searchData.status || !searchData.result || !searchData.result.datalist || !searchData.result.datalist.list || searchData.result.datalist.list.length === 0) {
      return await reply('No APK found for your query.');
    }

    // Get the first result
    const app = searchData.result.datalist.list[0];

    await reply(`📲 Downloading APK: ${app.name} (v${app.file.vername})`);

    await bot.sendChatAction(context.chatId, 'upload_document');

    // Send APK file
    await bot.sendDocument(context.chatId, app.file.path, {
      filename: `${app.uname}-${app.file.vername}.apk`,
      caption: `📱 ${app.name}\n👤 Developer: ${app.developer.name}\n⬇️ Downloads: ${app.stats.downloads}\n⭐ Rating: ${app.stats.rating.avg}`
    });

  } catch (error) {
    await reply('Error downloading APK. Try again later.');
  }
});
//========================================================================================================================


keith({
  pattern: "twitter",
  aliases: ["tw", "tweet"],
  category: "download",
  description: "Download Twitter videos",
  cooldown: 10
},

async (msg, bot, context) => {
  const { reply, q } = context;

  if (!q) {
    return await reply(`Please provide a Twitter video URL!\nExample: ${context.prefix}twitter https://twitter.com/futurism/status/882987478541533189`);
  }

  try {
    await bot.sendChatAction(context.chatId, 'typing');

    // Call Twitter downloader API
    const apiUrl = `https://apiskeith.vercel.app/download/twitter?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl, { timeout: 30000 });
    const data = response.data;

    if (!data.status || !data.result) {
      return await reply('Failed to fetch Twitter video.');
    }

    const videoUrl = data.result.video_hd || data.result.video_sd; // prefer HD

    await bot.sendChatAction(context.chatId, 'upload_video');

    // Send video only (no caption)
    await bot.sendVideo(context.chatId, videoUrl);

  } catch (error) {
    await reply('Error downloading Twitter video. Try again later.');
  }
});
//========================================================================================================================


keith({
  pattern: "pinterest",
  aliases: ["pin", "pindl"],
  category: "download",
  description: "Download Pinterest videos or images",
  cooldown: 10
},

async (msg, bot, context) => {
  const { reply, q } = context;

  if (!q) {
    return await reply(`Please provide a Pinterest URL!\nExample: ${context.prefix}pinterest https://pin.it/1zdlg6EPT`);
  }

  try {
    await bot.sendChatAction(context.chatId, 'typing');

    // Call Pinterest downloader API
    const apiUrl = `https://apiskeith.vercel.app/download/pindl2?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl, { timeout: 30000 });
    const data = response.data;

    if (!data.status || !data.result || !data.result.medias) {
      return await reply('Failed to fetch Pinterest media.');
    }

    const medias = data.result.medias;

    // Check for video
    const video = medias.find(m => m.videoAvailable);
    // Check for image
    const image = medias.find(m => !m.videoAvailable && m.extension === "jpg");

    await bot.sendChatAction(context.chatId, 'upload_video');

    if (video && image) {
      // Send both: image first, then video
      await bot.sendPhoto(context.chatId, image.url);
      await bot.sendVideo(context.chatId, video.url);
    } else if (video) {
      await bot.sendVideo(context.chatId, video.url);
    } else if (image) {
      await bot.sendPhoto(context.chatId, image.url);
    } else {
      await reply('No downloadable media found.');
    }

  } catch (error) {
    await reply('Error downloading Pinterest media. Try again later.');
  }
});
//========================================================================================================================


keith({
  pattern: "fb",
  aliases: ["facebook", "fbdown"],
  category: "download",
  description: "Download Facebook videos in HD",
  cooldown: 10
},

async (msg, bot, context) => {
  const { reply, q } = context;

  if (!q) {
    return await reply(`Please provide a Facebook video URL!\nExample: ${context.prefix}fb https://www.facebook.com/share/r/19zyz6X8KJ/`);
  }

  try {
    await bot.sendChatAction(context.chatId, 'typing');

    // Call Facebook downloader API
    const apiUrl = `https://apiskeith.vercel.app/download/fbdown?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl, { timeout: 30000 });
    const data = response.data;

    if (!data.status || !data.result || !data.result.media || !data.result.media.hd) {
      return await reply('Failed to fetch Facebook video.');
    }

    const hdUrl = data.result.media.hd; // HD video only

    await bot.sendChatAction(context.chatId, 'upload_video');

    // Send video without caption
    await bot.sendVideo(context.chatId, hdUrl);

  } catch (error) {
    await reply('Error downloading Facebook video. Try again later.');
  }
});
//========================================================================================================================

keith({
  pattern: "ig",
  aliases: ["insta", "instagram"],
  category: "download",
  description: "Download Instagram reels/videos",
  cooldown: 10
},

async (msg, bot, context) => {
  const { reply, q } = context;

  if (!q) {
    return await reply(`Please provide an Instagram reel/video URL!\nExample: ${context.prefix}ig https://www.instagram.com/reel/DD6q97IuzxD/`);
  }

  try {
    await bot.sendChatAction(context.chatId, 'typing');

    // Call Instagram downloader API
    const apiUrl = `https://apiskeith.vercel.app/download/instadl3?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl, { timeout: 30000 });
    const data = response.data;

    if (!data.status || !data.result) {
      return await reply('Failed to fetch Instagram video.');
    }

    const videoUrl = data.result;

    await bot.sendChatAction(context.chatId, 'upload_video');

    // Send video without caption
    await bot.sendVideo(context.chatId, videoUrl);

  } catch (error) {
    await reply('Error downloading Instagram video. Try again later.');
  }
});
//========================================================================================================================

keith({
  pattern: "tiktok",
  aliases: ["tt", "tik"],
  category: "download",
  description: "Download TikTok video in HD",
  cooldown: 10
},

async (msg, bot, context) => {
  const { reply, q } = context;

  if (!q) {
    return await reply(`Please provide a TikTok URL!\nExample: ${context.prefix}tiktok https://vt.tiktok.com/ZSje1Vkup/`);
  }

  try {
    await bot.sendChatAction(context.chatId, 'typing');

    // Call TikTok downloader API
    const apiUrl = `https://apiskeith.vercel.app/download/tiktokdl3?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl, { timeout: 30000 });
    const data = response.data;

    if (!data.status || !data.result || !data.result.downloadUrls || !data.result.downloadUrls.mp4HD) {
      return await reply('Failed to fetch TikTok video.');
    }

    const hdUrl = data.result.downloadUrls.mp4HD[0]; // HD video only

    await bot.sendChatAction(context.chatId, 'upload_video');

    // Send video without caption
    await bot.sendVideo(context.chatId, hdUrl);

  } catch (error) {
    await reply('Error downloading TikTok video. Try again later.');
  }
});
//========================================================================================================================


keith({
  pattern: "video",
  aliases: ["vid", "ytvideo"],
  category: "download",
  description: "Download video from YouTube",
  cooldown: 10
},

async (msg, bot, context) => {
  const { reply, q } = context;

  if (!q) {
    return await reply(`Please provide a video name!\nExample: ${context.prefix}video faded`);
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
    
    await reply(`Downloading video: ${video.title}`);
    await bot.sendChatAction(context.chatId, 'upload_video');

    // Download video
    const downloadUrl = `https://apiskeith.vercel.app/download/video?url=${encodeURIComponent(video.url)}`;
    const downloadResponse = await axios.get(downloadUrl);
    const downloadData = downloadResponse.data;

    if (downloadData.status && downloadData.result) {
      await bot.sendVideo(context.chatId, downloadData.result, {
        caption: `🎬 ${video.title}\n⏱️ ${video.duration}\n👁️ ${video.views}`
      });
    } else {
      await reply('Failed to download video.');
    }

  } catch (error) {
    await reply('Error downloading video. Try again later.');
  }
});
//=========================
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
