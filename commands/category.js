module.exports = {
	name: 'category',
	aliases: ['cat'],
	description: '',
	stage: ['pregame'],
	hostonly: true,
	execute(message, args, client) {
		const fs = require('fs');
		var tools = require('./../tools.js');
		let trivia_game = JSON.parse(fs.readFileSync("trivia_game.json", "utf8"));
		message.delete()
		if(args.length > 0){
			//process command
			if(args[0] == "all"){
				for(i=0;i<trivia_game.categories.length; i++){
					trivia_game.categories[i].selected = true
				}
			} else if(args[0] == "none"){
				for(i=0;i<trivia_game.categories.length; i++){
					trivia_game.categories[i].selected = false
				}
			} else {
				for(i=0; i<args.length; i++){
					if(!isNaN(Number(args[i])) && Number(args[i]) > 0 && Number(args[i])<= trivia_game.categories.length){
						if(trivia_game.categories[args[i]-1].selected){
							trivia_game.categories[args[i]-1].selected = false
						} else {
							trivia_game.categories[args[i]-1].selected = true
						}
					}
				}
			}
			let questions = JSON.parse(fs.readFileSync("questions.json", "utf8"));
			var selected = []
			//get array of selected categories
			for(i=0; i<trivia_game.categories.length; i++){
				if(trivia_game.categories[i].selected){
					selected.push(trivia_game.categories[i].name)
				}
			}
			//prepare filtered question array
			for(i=0; i<questions.questions.length; i++){
				if(!selected.includes(questions.questions[i].category)){
					questions.questions.splice(i, 1)
					i --
				}
			}
			//update files
			fs.writeFile("trivia_questions.json", JSON.stringify(questions), (err) => { //get questions for current game
				if (err) console.error(err)
			  });
			fs.writeFile("trivia_game.json", JSON.stringify(trivia_game), (err) => {
				if (err) console.error(err)
			});
			//update game message
			tools.triviaEmbed(client, message, trivia_game)
		}
	},
};