const gradient = require('gradient-string');

const logThemes = {
    info: ['#4facfe', '#00f2fe'],
    success: ['#00b09b', '#96c93d'],
    warning: ['#f83600', '#f9d423'],
    error: ['#ff416c', '#ff4b2b'],
    event: ['#8a2be2', '#da70d6'],
    message: ['#00c6ff', '#0072ff'],
    banner: ['#ff00cc', '#3333ff']
};

const KeithLogger = {
    info: (message) => console.log(gradient(logThemes.info[0], logThemes.info[1])(`ℹ️ ${message}`)),
    success: (message) => console.log(gradient(logThemes.success[0], logThemes.success[1])(`✓ ${message}`)),
    warning: (message) => console.log(gradient(logThemes.warning[0], logThemes.warning[1])(`⚠️ ${message}`)),
    error: (message) => console.log(gradient(logThemes.error[0], logThemes.error[1])(`✗ ${message}`)),
    event: (message) => console.log(gradient(logThemes.event[0], logThemes.event[1])(`✨ ${message}`)),
    message: (message) => console.log(gradient(logThemes.message[0], logThemes.message[1])(`✉️ ${message}`)),
    banner: (message) => console.log(gradient(logThemes.banner[0], logThemes.banner[1])(message)),
    
    // Message listener for different chat types
    logMessage: (msg) => {
        const chat = msg.chat;
        const from = msg.from;
        const text = msg.text || msg.caption || '[Media Message]';
        const messageType = msg.photo ? 'Photo' : 
                          msg.video ? 'Video' : 
                          msg.document ? 'Document' : 
                          msg.audio ? 'Audio' : 
                          msg.sticker ? 'Sticker' : 
                          'Text';
        
        const logOutput = `
┌─────────────────────────────────
│ 📩 ${chat.type.toUpperCase()} ${messageType} Message
├─────────────────────────────────
│ 🏷️ Chat: ${chat.title || 'Private'} (${chat.id})
│ 👤 User: ${from.first_name}${from.last_name ? ' ' + from.last_name : ''} 
│ 📛 Username: @${from.username || 'No username'}
│ 🆔 User ID: ${from.id}
│ 💬 Content: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}
└─────────────────────────────────`.trim();
        
        console.log(gradient(logThemes.message[0], logThemes.message[1])(logOutput));
    },
    
    // Event logger for different bot events
    logEvent: (event, data) => {
        const logOutput = `
┌─────────────────────────────────
│ ✨ ${event.toUpperCase()} Event
├─────────────────────────────────
│ ${data}
└─────────────────────────────────`.trim();
        
        console.log(gradient(logThemes.event[0], logThemes.event[1])(logOutput));
    }
};

module.exports = KeithLogger;
