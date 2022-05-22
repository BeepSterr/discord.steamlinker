const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const config = require("./config.js");
module.exports = function(client, module){

    if(typeof module.commands !== 'function'){
        return;
    }

    console.log(`Registering commands for module ${module.name}`)
    let commands = module.commands();

    const rest = new REST({ version: '10' }).setToken(config.auth.app_token);

    (async () => {
        try {

            await rest.put(
                Routes.applicationGuildCommands(config.auth.app_id, config.guild_id),
                { body: commands },
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();

}