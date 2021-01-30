module.exports = {
	name: 'join',
	description: 'lets a player join a trivia game',
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		var tools = require('./../tools.js');
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		if(trivia_game.channelid == message.channel.id && trivia_game.status == "pregame"){
			if(trivia_game.players[message.author.id] == undefined){
				var data = {
					name: message.author.username,
					ready: false,
					responses: [],
					score: 0
				}
				trivia_game.players[message.author.id] = data
				fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
					if (err) console.error(err)
				});
				tools.triviaEmbed(client, message, trivia_game)
				message.delete()
			} else {
				message.delete()
			}
			
		} else {
			message.channel.send("Sorry, there is no game available to join in this channel.").then(msg => {
				msg.delete({ timeout: 3000, reason: 'bot cleanup'})
				message.delete({ timeout: 3000, reason: 'bot cleanup'})
			})
			.catch()
		}
	},
};