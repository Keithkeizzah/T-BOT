
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
    
    // Split commands into chunks of 2 for better formatting
    for (let i = 0; i < cmds.length; i += 2) {
      const line = cmds.slice(i, i + 2)
        .map(cmd => `││◦➛ ${cmd}`)
        .join(' ');
      menu += `${line}\n`;
    }
    
    menu += `╰─────────────────────⏣\n`;
  }

  await reply(menu);
});
