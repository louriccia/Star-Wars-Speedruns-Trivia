module.exports = {
	name: 'help',
	aliases: [],
	description: '',
	stage: ['pregame', 'ingame', 'finished', undefined],
	hostonly: false,
	execute(message, args, client) {
		const fs = require('fs');
		const Discord = require('discord.js');
		let trivia_config = JSON.parse(fs.readFileSync("trivia_config.json", "utf8"));
        const helpEmbed = new Discord.MessageEmbed()
            .setTitle("Trivia Game Commands")
            .setColor("3B88C3")
            .addField("General", 
            "`.trivia new 'game name'` create a new trivia game as host" +
            "\n`.help` see this message" +
            "\n`.register` register a discord channel as a designated trivia game channel (mod only)")
            .addField("Pre-Game",
            "`.join` / `.unjoin` to join or leave the game" +
            "\n`.ready` or click :green_circle: to mark yourself as ready" +
            "\n`.unready` or click :o: to mark yourself as unready")
            .addField("In-Game",
            "as questions appear, type the letter for the correct answer" +
            "\n`.forfeit` or `.quit` to quit the game" +
            "\n`.scores` to see the current scores for all players")
            .addField("Scoring", "You have **" + trivia_config.total_question_time +
            "** seconds to answer each question. Answering a question correctly in the first **" + 
            trivia_config.max_score_time + "** seconds will award you the full **" + trivia_config.max_score + 
            "** points. The longer you take to answer, the fewer points you will receive for correct answers.")
            .addField("Host Only",
            "`.cat all/none/#` to select/deselect question categories" +
            "\n`.trivia` view/repost current game lobby and selected categories" +
            "\n`.start` or click :arrow_forward: to start the game" +
            "\n`.start -f` to force start the game with unreadied players (mod only)" +
            "\n`.next` or react with :arrow_forward: for the next question" +
            "\n`.cancel` to cancel the game without saving" +
            "\n`.done` to save and end the game and post final results (`-f` to force end a game as mod)")
		message.channel.send(helpEmbed)
	},
};