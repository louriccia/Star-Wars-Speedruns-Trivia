module.exports = {
	name: 'next',
	aliases: [],
	description: 'used by the host to get the next question',
	stage: ['ingame'],
	hostonly: true,
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
		var players = trivia_game.players
		//check if enough players are still playing
		var keys = Object.keys(players)
		var stillPlaying = 0
		for(i=0; i<keys.length; i++){
			var k = keys[i];
			if(players[k].status !== "forfeit"){
				stillPlaying++
			}
		}
		if(stillPlaying >= trivia_config.min_players){
			trivia_game.status = "inquestion"
			trivia_game.num_questions ++
			//update game file
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
				//add responses for forfeited players
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
					var correctChoicefile = [" ", " ", " ", " "]
					var correctResponse = []
					var options = ["a", "b", "c", "d"]
					const isCorrect = (element) => element == correct;
					if(correct !== ""){
						correctChoice[options.findIndex(isCorrect)] = "*   :white_check_mark:"
						correctChoicefile[options.findIndex(isCorrect)] = " - CORRECT"
						//get number of responses for each question
						for(i = 0; i<options.length; i ++){
							if(trivia_game.questions[trivia_game.questions.length -1].response_count[options[i]] > 0){
								correctResponse.push("`" + trivia_game.questions[trivia_game.questions.length -1].response_count[options[i]] + " player(s) answered`")
							} else {
								correctResponse.push(" ")
							}
						}
						//get alphabetic list of players
						var players = trivia_game.players
						var keys = Object.keys(players)
						var playerlist = []
						var playerscore = ""
						for(i=0; i<keys.length; i++){
							var k = keys[i];
							playerlist.push(trivia_game.players[k])
						}
						playerlist.sort(function(a, b) {
							var textA = a.name.toUpperCase();
							var textB = b.name.toUpperCase();
							return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
						});
						//prepare round score file
						for(i=0; i<playerlist.length; i++){
							if(playerlist[i].responses.length>0){
								if(playerlist[i].responses[playerlist[i].responses.length -1].score > 0){
									playerscore += playerlist[i].name + " - " + playerlist[i].responses[playerlist[i].responses.length -1].answer + " - CORRECT! - " + playerlist[i].responses[playerlist[i].responses.length -1].score + " Points\n"
								} else {
									playerscore += playerlist[i].name + " - " + playerlist[i].responses[playerlist[i].responses.length -1].answer + "\n"
								}
							}
						}
						//write round score file
						fs.writeFile("streamfiles/trivia_scores_round.txt", playerscore, function (err) {
								if (err) return console.log(err);
							})
						//prepare game score file
						playerlist.sort(function(a,b) {
							return b.score-a.score;
						})
						playerscore = ""
						for(i=0; i<playerlist.length; i++){
							playerscore += playerlist[i].name + " - " + playerlist[i].score + "\n"
						}
						//write game score file
						fs.writeFile("streamfiles/trivia_scores_total.txt", playerscore, function (err) {
							if (err) return console.log(err);
						})
					}
					//prepare question embed
					const questionEmbed = new Discord.MessageEmbed()
						.setTitle(question.question)
						.setAuthor("Question " + trivia_game.num_questions + " - " + question.series)
						.setFooter((trivia_game.questions[trivia_game.questions.length -1].response_count.a+trivia_game.questions[trivia_game.questions.length -1].response_count.b+trivia_game.questions[trivia_game.questions.length -1].response_count.c+trivia_game.questions[trivia_game.questions.length -1].response_count.d)+ "/" + stillPlaying + " answered")
						.setColor("FAA61A")
						.addFields([
						{
						name: ":regional_indicator_a:   " + correctChoice[0][0] + question["A"]  + correctChoice[0],
						value: correctResponse[0] + '\u200B'
						}, {
						name: ":regional_indicator_b:   " + correctChoice[1][0] + question["B"] + correctChoice[1],
						value: correctResponse[1] + '\u200B'
						}, {
						name: ":regional_indicator_c:   " + correctChoice[2][0] + question["C"] + correctChoice[2],
						value: correctResponse[2] + '\u200B'
						}, {
						name: ":regional_indicator_d:   " + correctChoice[3][0] + question["D"] + correctChoice[3],
						value: correctResponse[3] + '\u200B'
						}])
						if(correct !== undefined){
							questionEmbed.setColor("3B88C3")
						}
						fs.writeFile("streamfiles/trivia_question.txt", question.question + 
							"\n    A: " + question["A"] + correctChoicefile[0] + 
							"\n    B: " + question["B"] + correctChoicefile[1] + 
							"\n    C: " + question["C"] + correctChoicefile[2] + 
							"\n    D: " + question["D"] + correctChoicefile[3], function (err) {
								if (err) return console.log(err);
							})

					return questionEmbed
				}
				
				//write question file for stream
				question.response_count = {a: 0, b: 0, c: 0, d: 0}
				trivia_game.questions.push(question)
				questions.splice(randomquestion, 1)
				fs.writeFile("trivia_questions.json", JSON.stringify(trivia_questions), (err) => {
					if (err) console.error(err)
				});
				//send question
				message.channel.send(triviarole, questionMessage()).then(sentMessage => {
					/* reaction answers
					sentMessage.react('🇦').then(sentMessage.react("🇧")).then(sentMessage.react("🇨")).then(sentMessage.react("🇩")).then(async function (mes) { //Regional Indicator Symbol Letter A Regional Indicator Symbol Letter B
						const filter = (reaction, user) => {
							return (['🇦', "🇧", "🇨", '🇩', '▶️'].includes(reaction.emoji.name) && trivia_game.players[user.id] !== undefined);
						};   
						const answercollector = sentMessage.createReactionCollector(filter, {time:900000})
							answercollector.on('collect', (reaction, user) => {
								if(['🇦', "🇧", "🇨", '🇩'].includes(reaction.emoji.name) && trivia_game.players[user.id] !== undefined){ //
									sentMessage.reactions.resolve(reaction).users.remove(user.id);
								}
																
							})
					})*/
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
							sentMessage.edit("", questionMessage(correct))
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
					}, totalQuestionTime*1000)
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
							trivia_game.questions[trivia_game.questions.length-1].response_count[answer] ++
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
								player.score = player.score + score
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
								//reveal answer / responses
								allAnswered = true
								trivia_game.status = "ingame"
								sentMessage.edit("", questionMessage(correct))
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
			message.channel.send("Sorry, there are not enough players remaining to continue the game. \n The host may close and save the game with `.done` or quit the game without saving using `.cancel`")
		}
	},
};