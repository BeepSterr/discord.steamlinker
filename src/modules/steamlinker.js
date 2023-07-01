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
        for (let url of urls) {
            return await urlToEmbed(url);
        }
    }

    async handleInteraction(interaction) {

        if (interaction instanceof MessageContextMenuCommandInteraction && interaction.commandName === this.interaction_name) {

            // API calls can take a second, defer!

            // Messages older than 1 hour will be replied to emphemerally, to prevent spam.
            let emp = false;
            if(interaction.targetMessage.createdAt < new Date(Date.now() - 1000 * 60 * 60)){
                emp = true;
            }

            await interaction.deferReply({ephemeral: emp});

            try{
                let data = await this.getEmbeds(interaction.targetMessage);
                data.embeds.length > 0 ? await interaction.editReply({...data, content: "Result: "}) : await interaction.editReply({content: 'No steam links found'});
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