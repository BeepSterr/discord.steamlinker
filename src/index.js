import { Client, GatewayIntentBits } from 'discord.js';

const config = (await import('../config.js')).default;


let client = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.modules = {};
client.registerCommand = (await import('./register.js')).default;

if(process.env.NODE_ENV !== 'production'){
    client.on('debug', console.debug)
}

client.login(config.auth.app_token);

client.on('messageCreate', (message) => {

});

client.on('ready', async ()=>{

    console.log(`Connection to Discord established, Logged in as: ${client.user.username}`)

    const moduleNames = Object.keys(config.modules);
    for(let moduleName of moduleNames){

        const moduleConfig = config.modules[moduleName];

        // Check if module is disabled.
        if(moduleConfig.enabled !== true){
            continue;
        }

        console.log(`Loading module: ${moduleName}`);
        const module = (await import('./modules/' + moduleName + '.js')).default;
        client.modules[moduleName] = new module(client, moduleConfig);
        client.modules[moduleName].name = moduleName;


    }

    // Register commands
    client.registerCommand(client, client.modules);
});
