const SteamParser = require("./parser/class.parser");
const Frame = require('bframe').Instance;

let config = require('dotenv').config();

let a = new Frame(config.parsed);
a.start();

//a.commands.add()

a.on('*', (event, ...message) => {
    //console.log(event);
    //console.log(...message);
});


a.on('client:message', (messages) => {

    messages.forEach( message => {

        const SteamParser = require("./parser/class.parser");
        let parser = new SteamParser(message.content);

        parser.getType().forEach( link => {

            link.getData(function(embed){
                message.reply({ embeds: [embed]});
            })

        });

    })


})