module.exports = {
	name: 'scores',
	aliases: [],
	description: '',
	stage: ['ingame'],
	hostonly: false,
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		var tools = require('./../tools.js');
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		var scoreEmbed = new Discord.MessageEmbed()
		var players = trivia_game.players
		var playerlist = []
		var playerscore = ""
		var keys = Object.keys(players)
		for(i=0; i<keys.length; i++){
			var k = keys[i];
			playerlist.push(trivia_game.players[k])
		}
		playerlist.sort(function(a,b) {
			return b.score-a.score;
		})
		var top3 = [":first_place:", ":second_place:", ":third_place:"]
		for(i=0; i<playerlist.length; i++){
			if(i < 3){
				playerscore += "\n**" + top3[i] + " " + playerlist[i].name + " - " + playerlist[i].score + "**"
			} else {
				playerscore += "\n**" + playerlist[i].name + " - " + playerlist[i].score + "**"
			}
		}
		//playerlist = playerlist + "\n" + trivia_game.players[k].name + " - " +  + trivia_game.players[k].score
		scoreEmbed
			.setTitle(trivia_game.name + " - Current Scores")
			.setDescription("Total scores after question " +  trivia_game.num_questions + ":\n" + playerscore)
		message.channel.send(scoreEmbed)
	},
};