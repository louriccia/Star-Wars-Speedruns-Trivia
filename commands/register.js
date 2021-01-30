module.exports = {
	name: 'register',
	aliases: [],
	description: 'registers the current channel as the trivia game channel',
	execute(message, args) {
		const fs = require('fs');
		let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
		if(message.channel.id == trivia_config.channelID){
			message.channel.send('<#' + message.channel.id + '> is already registered as the trivia game channel!');
		} else {
			trivia_config.channelID = message.channel.id
			trivia_config.channelName = message.channel.name
			fs.writeFile("trivia_config.json", JSON.stringify(trivia_config), (err) => {
				if (err) console.error(err)
			});
			message.channel.send('<#' + message.channel.id + '> has been successfully registered as the trivia game channel!');
		}
	},
};