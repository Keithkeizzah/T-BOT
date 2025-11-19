const { keith, commands } = require('../commandHandler');

keith({
  pattern: "menu",
  aliases: ["help", "cmd"],
  category: "general",
  description: "Show all commands",
  cooldown: 5
},

async (msg, bot, context) => {
  const { reply, pushName, botName, owner, prefix } = context;

  // Menu buttons
  const menuButtons = [
    [
        { text: 'Bot Site', url: 'https://keithsite.vercel.app' },
        { text: '👑 Owner', url: 'https://t.me/keithkeizzah' }
    ],
    [
        { text: '💬 Telegram Group', url: 'https://t.me/keithmd' }
    ]
  ];

  // Group commands by category
  const categories = {};
  commands.forEach(cmd => {
    if (!cmd.dontAddCommandList) {
      if (!categories[cmd.category]) {
        categories[cmd.category] = [];
      }
      categories[cmd.category].push(cmd.pattern);
    }
  });

  // Build menu
  let menu = `Hello, ${pushName || 'User'}\n`;
  menu += `╭━━⟮ ${botName} ⟯━━━━┈⊷\n`;
  menu += `┃✵╭──────────────\n`;
  menu += `┃✵│ Owner : ${owner}\n`;
  menu += `┃✵│ Commands: ${commands.length}\n`;
  menu += `┃✵│ Prefix: ${prefix}\n`;
  menu += `┃✵╰─────────────\n`;
  menu += `╰━━━━━━━━━━━━━━━━┈⊷\n\n`;

  // Add categories and commands
  for (const [category, cmds] of Object.entries(categories)) {
    menu += `╭─────「 ${category} 」─┈⊷\n`;
    
    // List all commands in the category
    cmds.forEach(cmd => {
      menu += `││◦➛ ${cmd}\n`;
    });
    
    menu += `╰─────────────────────⏣\n`;
  }

  await reply(menu, {
    reply_markup: {
      inline_keyboard: menuButtons
    }
  });
});
