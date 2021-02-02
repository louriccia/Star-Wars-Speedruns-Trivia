module.exports = {
	name: 'cancel',
	aliases: [],
	description: "cancels a game before it's started",
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		var tools = require('./../tools.js');
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
		if(trivia_game.hostid == message.author.id){
			message.channel.send("The game `" + trivia_game.name + "` has been canceled by the host")
			message.channel.messages.fetch(trivia_game.message)
              	.then(msg => {
                  	msg.delete()
              
			  	}).catch(err=> console.log(err));
			var players = trivia_game.players
			var keys = Object.keys(players)
			for(i=0; i<keys.length; i++){ //remove trivia role
				var k = keys[i];
				let role = message.guild.roles.cache.find(r=>r.name === trivia_config.roles.trivia_player)
				if(role !== undefined){
					message.guild.members.cache.get(k).roles.remove(role.id).catch(error=>console.log(error))
				}
			}
			trivia_game = {}
			fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
				if (err) console.error(err)
			});
			
		} else {
			message.channel.send("You are not hosting any active games")
		}
	},
};