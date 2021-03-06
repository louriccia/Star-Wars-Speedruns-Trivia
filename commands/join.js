module.exports = {
	name: 'join',
	aliases: [],
	description: 'lets a player join a trivia game',
	stage: ['pregame'],
	hostonly: false,
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		var tools = require('./../tools.js');
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
		
		if(trivia_game.players[message.author.id] == undefined){
			//initialize player
			var data = {
				name: message.author.username,
				status: "unready",
				responses: [],
				score: 0
			}
			trivia_game.players[message.author.id] = data
			fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
				if (err) console.error(err)
			});
			//update game message
			tools.triviaEmbed(client, message, trivia_game)
			//get trivia role
			let role = message.guild.roles.cache.find(r=>r.name === trivia_config.roles.trivia_player)
			if(role !== undefined){
				message.member.roles.add(role.id).catch(error=>console.log(error))
			}
			message.delete()
		} else {
			message.delete()
		}
	},
};