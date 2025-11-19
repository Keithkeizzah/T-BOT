const { keith } = require('../commandHandler');
const os = require('os');
const process = require('process');

keith({
    pattern: "ping",
    aliases: ["speed", "test"],
    category: "system",
    description: "Check bot's response time",
    cooldown: 3
},

async (msg, bot, context) => {
    const { reply } = context;

    try {
        const startTime = Date.now();
        
        // Send initial message
        const sentMessage = await reply("🏓 Pong!");
        
        // Calculate ping after message is sent
        const endTime = Date.now();
        const pingTime = endTime - startTime;

        // Edit the original message with the ping time
        await bot.editMessageText(`🏓 Pong!\n⚡ Ping: ${pingTime}ms`, {
            chat_id: context.chatId,
            message_id: sentMessage.message_id
        });

    } catch (error) {
        console.error('[ERROR]', error);
        await reply('An error occurred while checking ping.');
    }
});


keith({
    pattern: "uptime",
    aliases: ["stats", "status"],
    category: "system",
    description: "Display bot statistics",
    cooldown: 5
},

async (msg, bot, context) => {
    const { reply, botName } = context;

    try {
        const uptime = process.uptime(); 
        const memoryUsage = (process.memoryUsage().rss / (1024 * 1024)).toFixed(2);
        const cpuLoad = os.loadavg()[0].toFixed(2);

        const statsMessage = `
📊 ${botName} Statistics 📊

🕒 Uptime: ${formatUptime(uptime)}
💾 Memory Usage: ${memoryUsage} MB
⚡ CPU Load: ${cpuLoad}
        `.trim();

        await reply(statsMessage);
    } catch (error) {
        console.error('[ERROR]', error);
        await reply('An error occurred while fetching the stats.');
    }
});

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemaining = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secondsRemaining}s`;
}
