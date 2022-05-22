const config = require("./config.js");
const { Client, Intents } = require("discord.js");

let client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

client.modules = {};
client.registerCommand = require('./register.js');

client.login(config.auth.app_token);

client.on('ready', ()=>{

    console.log(`Connection to Discord established, Logged in as: ${client.user.username}`)

    const moduleNames = Object.keys(config.modules);
    for(let moduleName of moduleNames){

        const moduleConfig = config.modules[moduleName];

        // Check if module is disabled.
        if(moduleConfig.enabled !== true){
            continue;
        }

        console.log(`Loading module: ${moduleName}`);
        const module = require('./modules/' + moduleName + '.js');
        client.modules[moduleName] = new module(client, moduleConfig);
        client.modules[moduleName].name = moduleName;

        // Register commands
        client.registerCommand(client, client.modules[moduleName]);

    }
});
