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
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================

keith({
    pattern: "admins",
    aliases: ["adminlist", "listadmins"],
    category: "group",
    description: "List all group admins",
    cooldown: 10
},

async (msg, bot, context) => {
    const { reply } = context;

    try {
        const admins = await bot.getChatAdministrators(context.chatId);
        
        if (admins.length === 0) {
            return await reply("❌ No admins found in this group.");
        }

        let adminList = "👑 *Group Admins:*\n\n";
        
        admins.forEach((admin, index) => {
            const user = admin.user;
            const name = user.first_name + (user.last_name ? ' ' + user.last_name : '');
            const username = user.username ? `(@${user.username})` : '';
            const status = admin.status === 'creator' ? ' 👑 Creator' : ' ⭐ Admin';
            
            adminList += `${index + 1}. ${name} ${username}${status}\n`;
        });

        await reply(adminList, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error('Admin list error:', error);
        await reply("❌ Failed to get admin list. Make sure this is a group chat.");
    }
});
//========================================================================================================================

keith({
    pattern: "demote",
    aliases: ["removeadmin", "unadmin"],
    category: "group",
    description: "Demote a user from admin",
    role: 1, // Only group admins can use
    cooldown: 5
},

async (msg, bot, context) => {
    const { reply, messageReply, isAdmin, pushName } = context;

    if (!isAdmin) {
        return await reply("❌ This command can only be used by group admins.");
    }

    if (!messageReply) {
        return await reply("❌ Please reply to the user you want to demote.");
    }

    const targetUserId = messageReply.from.id;
    const targetUserName = messageReply.from.first_name + (messageReply.from.last_name ? ' ' + messageReply.from.last_name : '');

    try {
        // Demote the user (set all permissions to false)
        await bot.promoteChatMember(context.chatId, targetUserId, {
            can_change_info: false,
            can_delete_messages: false,
            can_invite_users: false,
            can_restrict_members: false,
            can_pin_messages: false,
            can_promote_members: false,
            can_manage_chat: false,
            can_manage_video_chats: false,
            can_post_messages: false,
            can_edit_messages: false
        });

        await reply(`✅ Successfully demoted ${targetUserName} from admin!`);

    } catch (error) {
        console.error('Demote error:', error);
        
        if (error.response && error.response.statusCode === 400) {
            await reply("❌ I need admin permissions to demote users.");
        } else if (error.response && error.response.statusCode === 403) {
            await reply("❌ Cannot demote this user. They might not be an admin or I don't have sufficient permissions.");
        } else {
            await reply("❌ Failed to demote user. Make sure I have admin permissions.");
        }
    }
});
//========================================================================================================================
//======================================
keith({
    pattern: "promote",
    aliases: ["admin", "makeadmin"],
    category: "group",
    description: "Promote a user to admin",
    role: 1, // Only group admins can use
    cooldown: 5
},

async (msg, bot, context) => {
    const { reply, messageReply, isAdmin, pushName } = context;

    if (!isAdmin) {
        return await reply("❌ This command can only be used by group admins.");
    }

    if (!messageReply) {
        return await reply("❌ Please reply to the user you want to promote.");
    }

    const targetUserId = messageReply.from.id;
    const targetUserName = messageReply.from.first_name + (messageReply.from.last_name ? ' ' + messageReply.from.last_name : '');

    try {
        // Promote the user
        await bot.promoteChatMember(context.chatId, targetUserId, {
            can_change_info: true,
            can_delete_messages: true,
            can_invite_users: true,
            can_restrict_members: true,
            can_pin_messages: true,
            can_promote_members: false,
            can_manage_chat: true,
            can_manage_video_chats: true
        });

        await reply(`✅ Successfully promoted ${targetUserName} to admin!`);

    } catch (error) {
        console.error('Promote error:', error);
        
        if (error.response && error.response.statusCode === 400) {
            await reply("❌ I need admin permissions to promote users.");
        } else if (error.response && error.response.statusCode === 403) {
            await reply("❌ Cannot promote this user. They might already be an admin or I don't have sufficient permissions.");
        } else {
            await reply("❌ Failed to promote user. Make sure I have admin permissions.");
        }
    }
});
