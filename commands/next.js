module.exports = {
	name: 'next',
	aliases: [],
	description: 'used by the host to get the next question',
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		var tools = require('../tools.js');
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
		/*Show series
		The Bot will also generate a text file with the current question and answers to be displayed on stream.
		*/
		var players = trivia_game.players
		var keys = Object.keys(players)
		var stillPlaying = 0
		for(i=0; i<keys.length; i++){
			var k = keys[i];
			if(players[k].status !== "forfeit"){
				stillPlaying++
			}
		}
		if(stillPlaying >= trivia_config.min_players){
			if(trivia_game.status == "ingame" && trivia_game.hostid == message.author.id){
				trivia_game.status = "inquestion"
				fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
					if (err) console.error(err)
				});
				//prepare question
				let trivia_questions = JSON.parse(fs.readFileSync("trivia_questions.json", "utf8"));
				var questions = trivia_questions.questions
				let role = message.guild.roles.cache.find(r=>r.name === trivia_config.roles.trivia_player)
				let triviarole = ""
				if(role !== undefined){
					triviarole = "<@&" + role.id + ">"
				}
				if(questions.length > 0){
					var randomquestion = Math.floor(Math.random()*questions.length)
					var question = questions[randomquestion]
					var correct = questions[randomquestion].answer.toLowerCase()
					var responded = []
					var players = trivia_game.players
					var keys = Object.keys(players)
					for(i=0; i<keys.length; i++){
						var k = keys[i];
						if(players[k].status == "forfeit"){
							var data = {
								answer: "FORFEIT",
								score: 0
							}
							var player = trivia_game.players[k]
							if(player !== undefined){
								player.responses.push(data)
								responded.push(k)
							}
						}
					}
					function questionMessage(correct){
						var correctChoice = [" ", " ", " ", " "]
						var options = ["a", "b", "c", "d"]
						const isCorrect = (element) => element == correct;
						if(correct !== ""){
							correctChoice[options.findIndex(isCorrect)] = "*   :white_check_mark:"
						}
						const questionEmbed = new Discord.MessageEmbed()
							.setTitle(question.question)
							//.setFooter(series)
							.addFields([
							{
							name: ":regional_indicator_a:   " + correctChoice[0][0] + question["A"]  + correctChoice[0],
							value: '\u200B'
							}, {
							name: ":regional_indicator_b:   " + correctChoice[1][0] + question["B"] + correctChoice[1],
							value: '\u200B'
							}, {
							name: ":regional_indicator_c:   " + correctChoice[2][0] + question["C"] + correctChoice[2],
							value: '\u200B'
							}, {
							name: ":regional_indicator_d:   " + correctChoice[3][0] + question["D"] + correctChoice[3],
							value: '\u200B'
							}])
						//output updated scoring files here
						//alphabetical
						//BMac - 1. Wedge - CORRECT! - 79 Points
						return questionEmbed
					}
					
					//write question file for stream
					fs.writeFile("trivia_question.txt", question.question + 
						"\n    A: " + question["A"] + 
						"\n    B: " + question["B"] + 
						"\n    C: " + question["C"] + 
						"\n    D: " + question["D"], function (err) {
						if (err) return console.log(err);
					})
					trivia_game.questions.push(question)
					questions.splice(randomquestion, 1)
					fs.writeFile("trivia_questions.json", JSON.stringify(trivia_questions), (err) => {
						if (err) console.error(err)
					});
					//send question
					message.channel.send(triviarole, questionMessage()).then(sentMessage => {
						var allAnswered = false
						var questionstart = Date.now()
						var totalQuestionTime = trivia_config.total_question_time
						if(totalQuestionTime == undefined){
							totalQuestionTime = 45
						}
						if(totalQuestionTime <15){
							totalQuestionTime = 15
						}
						setTimeout(function() { //10 second warning
							if(!allAnswered){message.channel.send("Answer now! Only 10 seconds remaining!")}
						}, (totalQuestionTime-10)*1000)
						setTimeout(function() { 
							if(!allAnswered){message.channel.send("3...")}
						}, (totalQuestionTime-3)*1000)
						setTimeout(function() { 
							if(!allAnswered){message.channel.send("2...")}
						}, (totalQuestionTime-2)*1000)
						setTimeout(function() { 
							if(!allAnswered){message.channel.send("1...")}
						}, (totalQuestionTime-1)*1000)
						setTimeout(function() { 
							if(!allAnswered){
								message.channel.send("The question time limit has expired.")
								trivia_game.status = "ingame"
								for(i=0; i<keys.length; i++){
									var k = keys[i];
									if(!responded.includes(k)){
										var data = {
											answer: "UNANSWERED",
											score: 0
										}
										trivia_game.players[k].responses.push(data)
									}
								}
								sentMessage.edit(questionMessage(correct))
								fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
									if (err) console.error(err)
								});
								allAnswered = true
								sentMessage.react('▶️').then(async function (mes) {
									const filter = (reaction, user) => {
										return (reaction.emoji.name == "▶️" && user.id == trivia_game.hostid);
									};   
									const collector = sentMessage.createReactionCollector(filter, {time:900000})
										collector.on('collect', (reaction, reactionCollector) => {
											client.commands.get('next').execute(message, args, client);									
										})
								})
							}
						}, 45000)
					//collect responses
						const collector = new Discord.MessageCollector(client.channels.cache.get(message.channel.id), m => m,{ time: totalQuestionTime*1000 });
						collector.on('collect', m => {
							var answer = m.content.toLowerCase()
							var questionend = Date.now()
							var maxScore = trivia_config.max_score
							var maxScoreTime = trivia_config.max_score_time
							if(maxScore == undefined){
								maxScore = 100
							}
							if(maxScoreTime ==undefined){
								maxScoreTime = 10
							}
							if(["a", "b", "c", "d"].includes(answer) && !allAnswered){
								m.delete()
								var score = 0
								if(answer == correct){
									var responsetime = questionend-questionstart
									if(responsetime < trivia_config.max_score_time*1000){
										score = trivia_config.max_score
									} else if (responsetime >= trivia_config.max_score_time*1000) {
										score = Math.ceil(maxScore-((responsetime-maxScoreTime*1000)/(totalQuestionTime*1000-maxScoreTime*1000))*maxScore)
									}
								}
								var data = {
									answer: answer.toUpperCase() + " - " + question[answer.toUpperCase()],
									score: score
								}
								var player = trivia_game.players[m.author.id]
								if(player !== undefined && !responded.includes(m.author.id)){
									player.responses.push(data)
								}
								responded.push(m.author.id)
								//check if everyone has responded
								var players = trivia_game.players
								var keys = Object.keys(players)
								var missingresponse = false
								for(i=0; i<keys.length; i++){
									var k = keys[i];
									if(!responded.includes(k)){
										missingresponse = true
									}
								}
								if(!missingresponse){
									allAnswered = true
									trivia_game.status = "ingame"
									sentMessage.edit(questionMessage(correct))
									sentMessage.react('▶️').then(async function (mes) {
										const filter = (reaction, user) => {
											return (reaction.emoji.name == "▶️" && user.id == trivia_game.hostid);
										};   
										const collector = sentMessage.createReactionCollector(filter, {time:900000})
											collector.on('collect', (reaction, reactionCollector) => {
												client.commands.get('next').execute(message, args, client);									
											})
									})
								}
								//save file
								
								fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
									if (err) console.error(err)
								});
		
							}
						})
					})
				} else {
					message.channel.send("Uh oh! Looks like there are no more questions available. \n The host may close and save the game with `.done` or quit the game without saving using `.cancel`")
				}
			} else {
				message.channel.send("There is already an active question").then(msg => {
					msg.delete({ timeout: 3000, reason: 'bot cleanup'})
					message.delete()
				})
			}
		} else {
			message.channel.send("Sorry, there are not enough players remaining to continue the game. \n The host may close and save the game with `.done` or quit the game without saving using `.cancel`")
		}
		
		
	},
};