const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Ready!')
})


client.on('message', message => {
    let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
    let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
    if(message.author.bot) return; //trumps any command from executing from a bot message
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;
    if(commandName !== "register" && message.channel.id !== trivia_config.channelID){
        message.channel.send("Can't do that here. This channel is not registered for trivia games.")
        if(trivia_config.channelID !== undefined){
            message.channel.send("<#" + trivia_config.channelID+"> is currently registered as the trivia game channel.")
        }
    } else if (!command.stage.includes(trivia_game.status)){
        message.channel.send("Command cannot be called at this time").then(msg => {
            msg.delete({ timeout: 3000, reason: 'bot cleanup'})
            message.delete({ timeout: 3000, reason: 'bot cleanup'})
        })
        .catch()
    } else if (command.hostonly && message.author.id !== trivia_game.hostid && !["finished", undefined].includes(trivia_game.status) && (!message.member.roles.cache.some(role => trivia_config.roles.bot_commander == role.name) || !message.member.hasPermission(['ADMINISTRATOR', 'MANAGE_GUILD']))){
        message.channel.send("This command can only be used by the game host").then(msg => {
            msg.delete({ timeout: 3000, reason: 'bot cleanup'})
            message.delete({ timeout: 3000, reason: 'bot cleanup'})
        })
        .catch()
    } else {
        try {
            command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.reply("`Error: Command failed to execute `")
        }
    }
})

client.login(token);
//invite link
//https://discord.com/oauth2/authorize?client_id=803797167617605652&permissions=268512320&scope=bot