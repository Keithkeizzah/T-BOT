const { keith } = require('../commandHandler');

keith({
    pattern: "hack",
    aliases: ["hacker", "prank"],
    category: "fun",
    description: "Prank hack simulation",
    cooldown: 30
},

async (msg, bot, context) => {
    const { reply, botName } = context;

    try {
        const steps = [
            "```Injecting Malware```",
            "``` █ 10%```",
            "```█ █ 20%```",
            "```█ █ █ 30%```",
            "```█ █ █ █ 40%```",
            "```█ █ █ █ █ 50%```",
            "```█ █ █ █ █ █ 60%```",
            "```█ █ █ █ █ █ █ 70%```",
            "```█ █ █ █ █ █ █ █ 80%```",
            "```█ █ █ █ █ █ █ █ █ 90%```",
            "```█ █ █ █ █ █ █ █ █ █ 100%```",
            "```System hijacking on process..```\n```Connecting to Server error to find 404```",
            "```Device successfully connected...\nReceiving data...```",
            "```Data hijacked from device 100% completed\nKilling all evidence, killing all malwares...```",
            "```HACKING COMPLETED```",
            "```SENDING LOG DOCUMENTS...```",
            "```SUCCESSFULLY SENT DATA AND Connection disconnected```",
            "```BACKLOGS CLEARED```",
            "```POWERED BY KEITH TBOT```",
            "```SYSTEM FUCKED 💀```"
        ];

        // Send initial message to get a message we can edit
        let progressMessage = await reply(steps[0], { parse_mode: 'Markdown' });

        // Edit the same message for each step
        for (let i = 1; i < steps.length; i++) {
            await bot.editMessageText(steps[i], {
                chat_id: context.chatId,
                message_id: progressMessage.message_id,
                parse_mode: 'Markdown'
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    } catch (error) {
        console.error('[ERROR]', error);
        await reply('An error occurred during the prank hack simulation.');
    }
});
