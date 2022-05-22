const {SlashCommandBuilder, SlashCommandStringOption, EmbedBuilder, RGBTuple} = require("@discordjs/builders");
const {BaseCommandInteraction, AutocompleteInteraction} = require("discord.js");
module.exports = class CannedTexts {

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
        client.on('interactionCreate', this.handleCommand.bind(this))

    }

    handleCommand(interaction){
        if (interaction.commandName !== 'paste') return;

        // Command Execution
        if(interaction instanceof BaseCommandInteraction){

            const pasteName = interaction.options.get('canned_response');
            const paste = this.#config.texts[pasteName.value];


            console.log(paste);
            if(paste === undefined){
                interaction.reply('Could not find that paste..');
                return;
            }

            let embed = new EmbedBuilder();
            embed.setTitle(paste.title);
            embed.setDescription(paste.text);

            interaction.reply({ embeds: [embed.toJSON()]});

        }

        // Autocomplete
        else if(interaction instanceof AutocompleteInteraction){

            let options = []
            for(let key of Object.keys(this.#config.texts)){
                options.push({
                    name: key,
                    value: key
                })
            }

            interaction.respond(options);

        }


    }

    commands(){
        return [
            new SlashCommandBuilder()
                .setName('paste')
                .setDescription('Get a canned text')
                .addStringOption(new SlashCommandStringOption()
                    .setName('canned_response')
                    .setDescription('Name of the response to respond with')
                    .setRequired(true)
                    .setAutocomplete(true)
                ),
        ]
    }

}