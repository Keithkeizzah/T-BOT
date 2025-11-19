const { keith } = require('../commandHandler');
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
//========================================================================================================================
//========================================================================================================================

keith({
    pattern: "chatid",
    aliases: ["gid", "groupid"],
    category: "utility",
    description: "Get chat ID",
    cooldown: 5
},

async (msg, bot, context) => {
    const { reply } = context;

    const chatType = msg.chat.type === 'private' ? 'Private Chat' : 
                    msg.chat.type === 'group' ? 'Group' : 
                    msg.chat.type === 'supergroup' ? 'Supergroup' : 
                    'Channel';

    await reply(`💬 *Chat Info:*\n\n🆔 *Chat ID:* \`${context.chatId}\`\n📋 *Type:* ${chatType}\n📛 *Name:* ${msg.chat.title || 'Private Chat'}`);
});
//========================================================================================================================

keith({
    pattern: "id",
    aliases: ["userid", "getid"],
    category: "utility",
    description: "Get user ID",
    cooldown: 5
},

async (msg, bot, context) => {
    const { reply, messageReply } = context;

    // If replying to a message, show that user's ID
    if (messageReply) {
        const user = messageReply.from;
        const userName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        const username = user.username ? `(@${user.username})` : '';
        
        await reply(`👤 *User Info:*\n\n🆔 *User ID:* \`${user.id}\`\n📛 *Name:* ${userName}\n🔖 *Username:* ${username || 'None'}`);
    }
    // If no reply, show own ID
    else {
        const user = msg.from;
        const userName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        const username = user.username ? `(@${user.username})` : '';
        
        await reply(`👤 *Your Info:*\n\n🆔 *User ID:* \`${user.id}\`\n📛 *Name:* ${userName}\n🔖 *Username:* ${username || 'None'}\n💬 *Chat ID:* \`${context.chatId}\``);
    }
});
//========================================================================================================================
//
keith({
  pattern: "chunk",
  aliases: ["details", "det", "ret"],
  category: "utility",
  description: "Displays raw quoted message in JSON format",
  cooldown: 10
},

async (msg, bot, context) => {
  const { reply, messageReply } = context;

  if (!messageReply) {
    return await reply("❌ Please reply to a message to inspect it.");
  }

  try {
    const json = JSON.stringify(messageReply, null, 2);
    const chunks = json.match(/[\s\S]{1,4000}/g) || [];

    for (const chunk of chunks) {
      const formatted = "```json\n" + chunk + "\n```";
      await reply(formatted, { parse_mode: 'Markdown' });
    }

  } catch (err) {
    await reply("❌ Error inspecting message.");
  }
});
