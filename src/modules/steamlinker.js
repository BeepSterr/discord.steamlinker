import {
    SlashCommandBuilder,
    SlashCommandStringOption,
    EmbedBuilder,
    ButtonInteraction,
    AutocompleteInteraction,
    CommandInteraction,
    ThreadChannel,
    ButtonBuilder,
    ActionRowBuilder,
    SlashCommandChannelOption,
    ChannelType,
    PermissionFlagsBits, MessageContextMenuCommandInteraction, ContextMenuCommandBuilder, ApplicationCommandType
} from "discord.js";
import urlToEmbed, {getSteamURLS} from "../lib/parser.js";
import {parse} from "dotenv";
export default class SteamLinker {

    #client;
    #config;

    /**
     * @param client discord.js.Client
     * @param moduleConfig Object
     */
    constructor(client, moduleConfig){

        this.#client = client;
        this.#config = moduleConfig;

        this.interaction_name = 'Get link';

        // Register Events
        client.on('messageCreate', this.MessageCreate.bind(this))
        client.on('interactionCreate', this.handleInteraction.bind(this))

    }

    MessageCreate(message){
        return;
    }

    async getEmbeds(message) {
        let urls = getSteamURLS(message.content);
        let embeds = [];
        for (let url of urls) {
            let result = await urlToEmbed(url);
            if(result instanceof EmbedBuilder) {
                embeds.push(result.toJSON());
            }
        }
        return embeds;
    }

    async handleInteraction(interaction) {

        if (interaction instanceof MessageContextMenuCommandInteraction && interaction.commandName === this.interaction_name) {

            // API calls can take a second, defer!
            await interaction.deferReply({ephemeral: true});

            try{
                let embeds = await this.getEmbeds(interaction.targetMessage);
                embeds.length > 0 ? await interaction.editReply({embeds: embeds}) : await interaction.editReply({content: 'No steam links found'});
            }catch(ex){
                await interaction.editReply( {content: '`⚠️ ' + ex.message + '`'})
            }
        }

    }

    commands(){
        return [
            new ContextMenuCommandBuilder()
                .setName(this.interaction_name)
                .setType(ApplicationCommandType.Message)
        ]
    }

}