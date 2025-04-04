const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const axios = require('axios');
const gradient = require('gradient-string');

// File paths
const chatGroupsFile = path.join(__dirname, 'chatGroups.json');
const messageCountFile = path.join(__dirname, 'messageCount.json');
const VERSION_FILE = path.join(__dirname, 'version.txt');

// Constants
const REPO_OWNER = 'keithkeizzah';
const REPO_NAME = 'T-BOT';

// Initialize files
function initializeFiles() {
    if (!fs.existsSync(messageCountFile)) {
        fs.writeFileSync(messageCountFile, JSON.stringify({}), 'utf8');
    }
    if (!fs.existsSync(chatGroupsFile)) {
        fs.writeFileSync(chatGroupsFile, JSON.stringify([]), 'utf8');
    }
    if (!fs.existsSync(VERSION_FILE)) {
        fs.writeFileSync(VERSION_FILE, '123456789');
        logger('[ Version file not found. ]\n\n [ Created version.txt ]');
    }
}

// Initialize bot
const bot = new TelegramBot(config.token, { polling: true });
let chatGroups = JSON.parse(fs.readFileSync(chatGroupsFile, 'utf8'));
let adminOnlyMode = false;
const cooldowns = new Map();
let gbanList = [];

// Logger setup
function createGradientLogger() {
    const colors = ['blue', 'cyan'];
    return (message) => {
        const colorIndex = Math.floor(Math.random() * colors.length);
        const color1 = colors[colorIndex];
        const color2 = colors[(colorIndex + 1) % colors.length];
        const gradientMessage = gradient(color1, color2)(message);
        console.log(gradientMessage);
    };
}
const logger = createGradientLogger();

// Bot banner
const botName = `  
_  _______ ___ _____ _   _     _____   ____   ___ _____
| |/ / ____|_ _|_   _| | | |   |_   _| | __ ) / _ \\_   _|
| ' /|  _|  | |  | | | |_| |_____| |   |  _ \\| | | || |
| . \\| |___ | |  | | |  _  |_____| |   | |_) | |_| || |
|_|\\_\\_____|___| |_| |_| |_|     |_|   |____/ \\___/ |_|
`;

// Load commands
const commands = [];
function loadCommands() {
    fs.readdirSync('./scripts/cmds').forEach((file) => {
        if (file.endsWith('.js')) {
            try {
                const command = require(`./scripts/cmds/${file}`);
                command.config.role = command.config.role || 0;
                command.config.cooldown = command.config.cooldown || 0;
                commands.push({ 
                    ...command, 
                    config: { 
                        ...command.config, 
                        name: command.config.name.toLowerCase() 
                    } 
                });
                registerCommand(bot, command);
            } catch (error) {
                logger(`Error loading command from file ${file}: ${error}`);
            }
        }
    });
}

// Command registration
function registerCommand(bot, command) {
    const prefixPattern = command.config.usePrefix ? 
        `^${config.prefix}${command.config.name}\\b(.*)$` : 
        `^${command.config.name}\\b(.*)$`;
    bot.onText(new RegExp(prefixPattern, 'i'), (msg, match) => {
        executeCommand(bot, command, msg, match);
    });
}

// Admin check
async function isUserAdmin(bot, chatId, userId) {
    try {
        const chatAdministrators = await bot.getChatAdministrators(chatId);
        return chatAdministrators.some(admin => admin.user.id === userId);
    } catch (error) {
        return false;
    }
}

// Command execution
async function executeCommand(bot, command, msg, match) {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const args = match[1].trim().split(/\s+/);
        const messageReply = msg.reply_to_message;

        if (gbanList.includes(userId.toString())) {
            return bot.sendMessage(chatId, "You are globally banned and cannot use commands.");
        }

        const isAdmin = await isUserAdmin(bot, chatId, userId);
        const isBotAdmin = userId === config.owner_id;

        if (adminOnlyMode && !isBotAdmin) {
            return bot.sendMessage(chatId, "Sorry, only the bot admin can use commands right now.");
        }

        if (command.config.role === 2 && !isBotAdmin) {
            return bot.sendMessage(chatId, "Sorry, only the bot admin can use this command.");
        }

        if (command.config.role === 1 && !isBotAdmin && !isAdmin) {
            return bot.sendMessage(chatId, "This command is only available to groups admins");
        }

        // Cooldown check
        const cooldownKey = `${command.config.name}-${userId}`;
        const now = Date.now();
        if (cooldowns.has(cooldownKey)) {
            const lastUsed = cooldowns.get(cooldownKey);
            const cooldownAmount = command.config.cooldown * 1000;
            if (now < lastUsed + cooldownAmount) {
                const timeLeft = Math.ceil((lastUsed + cooldownAmount - now) / 1000);
                return bot.sendMessage(chatId, `Please wait ${timeLeft} more seconds before using the ${command.config.name} command again.`);
            }
        }
        cooldowns.set(cooldownKey, now);

        // Execute command
        command.onStart({ 
            bot, 
            chatId, 
            args, 
            userId, 
            username: msg.from.username, 
            firstName: msg.from.first_name, 
            lastName: msg.from.last_name || '', 
            messageReply,
            messageReply_username: messageReply ? messageReply.from.username : null,
            messageReply_id: messageReply ? messageReply.from.id : null,
            msg, 
            match 
        });
    } catch (error) {
        logger(`Error executing command ${command.config.name}: ${error}`);
        bot.sendMessage(msg.chat.id, 'An error occurred while executing the command.');
    }
}

// GBan list management
async function fetchGbanList() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/samirxpikachuio/Gban/main/Gban.json');
        gbanList = response.data.map(user => user.ID);
    } catch (error) {
        logger('Error fetching gban list:', error);
    }
}

// Version checking
let lastCommitSha = null;
function loadLastCommitSha() {
    lastCommitSha = fs.readFileSync(VERSION_FILE, 'utf8').trim();
}

async function checkLatestCommit() {
    try {
        const response = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits`);
        const latestCommit = response.data[0];
        if (latestCommit.sha !== lastCommitSha) {
            logger(`\n[ New Update detected ]\n\n[ Current bot version: ${lastCommitSha} ]\n\n[ New version: ${latestCommit.sha} ]\n\n[ Update message: ${latestCommit.commit.message} by ${latestCommit.commit.author.name} ]`);
        }
    } catch (error) {
        logger('Error checking latest update contract https://t.me/keithkeizzah', error);
    }
}

// Message handling
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
        const data = fs.readFileSync(messageCountFile);
        const messageCount = JSON.parse(data);

        if (!messageCount[chatId]) messageCount[chatId] = {};
        if (!messageCount[chatId][userId]) messageCount[chatId][userId] = 0;
        messageCount[chatId][userId] += 1;

        fs.writeFileSync(messageCountFile, JSON.stringify(messageCount), 'utf8');
    } catch (error) {
        logger('[ERROR]', error);
    }

    if (!chatGroups.includes(chatId)) {
        chatGroups.push(chatId);
        fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups, null, 2));
    }
});

// New members handling
bot.on('new_chat_members', (msg) => {
    if (!config.greetNewMembers || !config.greetNewMembers.enabled) return;

    const chatId = msg.chat.id;
    const newMembers = msg.new_chat_members;
    const gifUrl = config.greetNewMembers.gifUrl;

    newMembers.forEach(member => {
        const fullName = `${member.first_name} ${member.last_name || ''}`.trim();
        const welcomeMessage = `Welcome, ${fullName}! We're glad to have you here.`;

        bot.sendAnimation(chatId, gifUrl)
            .then(() => bot.sendMessage(chatId, welcomeMessage))
            .catch(error => {
                logger("Error sending GIF:", error);
                bot.sendMessage(chatId, welcomeMessage);
            });
    });

    if (!chatGroups.includes(chatId)) {
        chatGroups.push(chatId);
        fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups, null, 2));
    }
});

// Left member handling
bot.on('left_chat_member', (msg) => {
    const chatId = msg.chat.id;
    if (chatGroups.includes(chatId)) {
        chatGroups = chatGroups.filter(id => id !== chatId);
        fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups, null, 2));
    }
});

// Callback query handling
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const data = JSON.parse(callbackQuery.data);
    const commandName = data.command;

    const command = commands.find(cmd => cmd.config.name === commandName);
    if (command && command.onReply) {
        command.onReply(bot, chatId, userId, data);
    }
});

// Error handling
bot.on('polling_error', (error) => {
    logger('Polling error:', error);
});

bot.on('polling_started', () => {
    logger('Bot polling started');
});

// Initialize everything
initializeFiles();
loadCommands();
fetchGbanList();
loadLastCommitSha();

// Schedule tasks
cron.schedule('*/1 * * * *', fetchGbanList);
cron.schedule('* * * * *', checkLatestCommit);

// Show bot info
logger(botName);
logger('[ Made by keithkeizzah ]');

module.exports = bot;
