module.exports = {
	name: 'question',
	description: 'gives a trivia question',
	execute(message, args) {
        const fs = require('fs');
        const Discord = require('discord.js');
        const questionEmbed = new Discord.MessageEmbed()
        var randomquestion = Math.floor(Math.random()*questions.length)
        questionEmbed.setTitle(questions[randomquestion].question)
          .addFields([
            {
              name: ":regional_indicator_a:   " + questions[randomquestion]["A"],
              value: '\u200B'
            }, {
              name: ":regional_indicator_b:   " + questions[randomquestion]["B"],
              value: '\u200B'
            }, {
              name: ":regional_indicator_c:   " + questions[randomquestion]["C"],
              value: '\u200B'
            }, {
              name: ":regional_indicator_d:   " + questions[randomquestion]["D"],
              value: '\u200B'
            }])
        

        message.channel.send(questionEmbed);
        fs.writeFile("trivia_question.txt", questions[randomquestion].question + "\n    A: " + questions[randomquestion]["A"] + "\n    B: " + questions[randomquestion]["B"] + "\n    C: " + questions[randomquestion]["C"] + "\n    D: " + questions[randomquestion]["D"], function (err) {
            if (err) return console.log(err);
          })
	},
};