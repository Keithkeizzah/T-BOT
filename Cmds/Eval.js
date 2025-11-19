const { keith } = require('../commandHandler');
const util = require('util');

keith({
    pattern: "eval",
    aliases: ["e", "run"],
    category: "owner",
    description: "Execute JavaScript code",
    role: 2, // Only bot admin can use
    cooldown: 3
},

async (msg, bot, context) => {
    const { reply, q, isSuperUser } = context;

    if (!isSuperUser) {
        return await reply("❌ This command is only for bot owner.");
    }

    if (!q) {
        return await reply("❌ Please provide code to evaluate.\nExample: .eval context.pushName");
    }

    try {
        await bot.sendChatAction(context.chatId, 'typing');

        // Enhanced context for eval
        const evalContext = {
            // Your context variables (direct access)
            pushName: context.pushName,
            sender: context.sender,
            owner: context.owner,
            isSuperUser: context.isSuperUser,
            isAdmin: context.isAdmin,
            userId: context.userId,
            chatId: context.chatId,
            q: context.q,
            args: context.args,
            messageReply: context.messageReply,
            botName: context.botName,
            prefix: context.prefix,
            ownerName: context.ownerName,
            timezone: context.timezone,
            sourceUrl: context.sourceUrl,
            
            // Functions
            reply: context.reply,
            sendMessage: context.sendMessage,
            
            // Core objects
            bot: bot,
            context: context,
            msg: msg,
            
            // Modules
            require: require,
            process: process,
            axios: require('axios'),
            fs: require('fs'),
            path: require('path'),
            config: require('../set'),
            util: util
        };

        // Wrap the code in async function
        let code = q.trim();
        const isExpression = !code.includes(';') && !code.includes('return') && !code.includes('{');
        
        if (isExpression) {
            code = `return ${code}`;
        }

        // Execute the code
        const fn = new Function(...Object.keys(evalContext), code);
        const result = await fn(...Object.values(evalContext));

        // Format the output
        let output;
        if (result === undefined || result === null) {
            output = "✅ Executed successfully (no return value)";
        } else if (typeof result === 'object') {
            output = util.inspect(result, { depth: 3, colors: false });
        } else {
            output = result.toString();
        }

        // Send the result (truncate if too long)
        const maxLength = 2000;
        if (output.length > maxLength) {
            output = output.substring(0, maxLength) + "\n... (truncated)";
        }

        await reply(`📝 *Input:* \`\`\`${q}\`\`\`\n\n💡 *Output:* \`\`\`${output}\`\`\``, {
            parse_mode: 'Markdown'
        });

    } catch (error) {
        await reply(`❌ *Error:* \`\`\`${error.message}\`\`\``, {
            parse_mode: 'Markdown'
        });
    }
});
