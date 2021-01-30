module.exports = {
	name: 'ready',
	aliases: ['unready'],
	description: 'readies a player',
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		var tools = require('./../tools.js');
		var ready = true
		if(message.content == ".unready") {
			ready = false
		}
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		if(trivia_game.channelid == message.channel.id && trivia_game.status == "pregame"){
			if(trivia_game.players[message.author.id] == undefined){
				var data = {
					name: message.author.username,
					ready: ready,
					responses: [],
					score: 0
				}
				trivia_game.players[message.author.id] = data
			}
			trivia_game.players[message.author.id].ready = ready
			fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
				if (err) console.error(err)
			});
			tools.triviaEmbed(client, message, trivia_game)
			message.delete()
		} else {
			message.channel.send("Sorry, there is no game available in this channel.").then(msg => {
				msg.delete({ timeout: 3000, reason: 'bot cleanup'})
				message.delete({ timeout: 3000, reason: 'bot cleanup'})
			})
			.catch()
		}
	},
};