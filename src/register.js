import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

const config = (await import('../config.js')).default;
export default function(client, modules){

    let commands = [];
    for(let mid of Object.keys(modules)){
        const module = modules[mid];
        if(typeof module.commands !== 'function'){
            continue;
        }

        console.log(`Registering commands for module ${module.name}`)
        commands.push(...module.commands());

    }

    const rest = new REST({ version: '10' }).setToken(config.auth.app_token);

    (async () => {
        try {

            if(process.env.NODE_ENV !== 'production'){
                for(let id of config.guild_ids){
                    await rest.put(
                        Routes.applicationGuildCommands(config.auth.app_id, id),
                        { body: commands },
                    );
                }
            }else{
                await rest.put(
                    Routes.applicationCommands(config.auth.app_id),
                    { body: commands },
                );
                for(let id of config.guild_ids) {
                    await rest.put(
                        Routes.applicationGuildCommands(config.auth.app_id, id),
                        {body: []},
                    );
                }
            }



            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();

}