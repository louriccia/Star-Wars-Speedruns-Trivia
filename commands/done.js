module.exports = {
	name: 'done',
	aliases: [],
	description: '',
	stage: ['ingame'],
	hostonly: true,
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
		if(message.author.id == trivia_game.hostid || (args[0] == "-f" && (message.member.roles.cache.some(role => trivia_config.roles.bot_commander == role.name)|| message.member.hasPermission(['ADMINISTRATOR', 'MANAGE_GUILD'])))){
			trivia_game.status = "finished"
			//save game to save folder
			fs.writeFile("saves/" + trivia_game.date.replace(/:/g, '.') + "_" + trivia_game.name.replace(/[|&;$%@"<>()+,]/g, "") +".json", JSON.stringify(trivia_game), (err) => {
				if (err) console.error(err)
			});
			//reset game file
			trivia_game = {}
			fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
				if (err) console.error(err)
			});
			//prepare final score embed
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
				var gotRight = 0
				for(j=0; j<playerlist[i].responses.length; j++){
					if(playerlist[i].responses[j].score > 0){
						gotRight ++
					}
				}
				if(i < 3){
					playerscore += "\n**" + top3[i] + " " + playerlist[i].name + " - " + playerlist[i].score + " Points** (" + gotRight + "/" + trivia_game.num_questions + ")"
				} else {
					playerscore += "\n**" + playerlist[i].name + " - " + playerlist[i].score + " Points** (" + gotRight + "/" + trivia_game.num_questions + ")"
				}
			}
			scoreEmbed
				.setTitle(trivia_game.name + " - Final Scores")
				.setColor("3B88C3")
				.setDescription(trivia_game.num_questions + " Total Questions | " + trivia_game.num_questions*trivia_config.max_score + " Possible Points\n" + playerscore)
			let role = message.guild.roles.cache.find(r=>r.name === trivia_config.roles.trivia_player)
			let triviarole = ""
			if(role !== undefined){
				triviarole = "<@&" + role.id + ">"
			}
			var endmessage = triviarole + " Thanks for playing! The host has ended the game. Here are the final results:"
			message.channel.send(endmessage,scoreEmbed)
			
			//remove trivia role
			var players = trivia_game.players
			var keys = Object.keys(players)
			for(i=0; i<keys.length; i++){ 
				var k = keys[i];
				let role = message.guild.roles.cache.find(r=>r.name === trivia_config.roles.trivia_player)
				if(role !== undefined){
					message.guild.members.cache.get(k).roles.remove(role.id).catch(error=>console.log(error))
				}
			}
		} else {
			message.channel.send("Only the host can use this command.")
		}
			
	},
};