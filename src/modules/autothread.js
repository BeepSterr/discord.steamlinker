export default class Rolemerge {

    #client;
    #config;

    /**
     * @param client discord.js.Client
     * @param moduleConfig Object
     */
    constructor(client, moduleConfig){

        this.#client = client;
        this.#config = moduleConfig;

        // Register Events
        client.on('messageCreate', this.MessageCreate.bind(this))

    }

    MessageCreate(message){

        if(message.threadId){
            return;
        }

        if(this.#config.channels.includes(message.channel.id)){
            // Create thread for message
            message.startThread({
                name: message.author.username,
                autoArchiveDuration: 60,
                reason: 'Automatic Thread Creation'
            }).then( (thread) => {
                thread.send(`**${message.author.username}** said: ${message.content}`);
            });
        }

    }

}