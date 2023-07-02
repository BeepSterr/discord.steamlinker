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

    async MessageCreate(message) {
        if (message.author.bot) {
            return;
        }

        let steam_content = await this.getEmbeds(message);

        if(steam_content.embeds && steam_content.embeds.length > 0 ){
            await message.reply(steam_content);

            try {
                await message.suppressEmbeds(true);
            }catch(e){
                console.log('Failed to suppress embeds', e.message);
            }
        }

    }

    async getEmbeds(message) {
        let urls = getSteamURLS(message.content);

        let reply_data = {
            embeds: [],
            components: [new ActionRowBuilder()]
        }

        if(urls > 5){
            return {content: 'Found too many links in a single message, Please try again with less than 5 links.'}
        }

        for (let url of urls) {
            let data = await urlToEmbed(url);
            reply_data.embeds.push(data.embed);
            reply_data.components[0].addComponents(data.buttons);
        }

        console.log(reply_data.components);
        console.log(reply_data.components[0]);

        reply_data.components[0] = reply_data.components[0].toJSON()

        return reply_data;
    }

    async handleInteraction(interaction) {

        if(interaction instanceof CommandInteraction && interaction.commandName === 'help'){

            const embed = new EmbedBuilder();
            embed.setTitle('Steam Linker');
            embed.setDescription('Steam Linker is a bot that will automatically embed steam links in your messages.');
            embed.addFields([
                {
                    name: "Usage",
                    value: "Sending a link to a supported steam page will automatically embed the link. You can also right click a message and select `Get link` to get the link for a message.\n\n",
                    inline: false
                },
                {
                    name: "Support",
                    value: "If you need help with this bot, please join the [support server](https://awoo.to/discord) and make a post in <#1124740782188925091>.\n\n",
                    inline: false
                },
                {
                    name: "Privacy Policy",
                    value: "[Privacy Policy](https://awoo.to/slprivacy)",
                    inline: true
                }
            ])

            return await interaction.reply({embeds: [embed.toJSON()], ephemeral: true});
        }

        if (interaction instanceof MessageContextMenuCommandInteraction && interaction.commandName === this.interaction_name) {

            // API calls can take a second, defer!

            // Messages older than 1 hour will be replied to emphemerally, to prevent spam.
            let emp = false;
            if(interaction.targetMessage.createdAt < new Date(Date.now() - 1000 * 60 * 60)){
                emp = true;
            }

            await interaction.deferReply({ephemeral: emp});

            try{
                let reply_data = await this.getEmbeds(interaction.targetMessage);
                console.log(reply_data);
                (reply_data.content || reply_data.embeds.length > 0) ? await interaction.editReply({...reply_data}) : await interaction.editReply({content: 'No steam links found'});
            }catch(ex){
                console.error(ex);
                await interaction.editReply( {content: '`⚠️ ' + ex.message + '`'})
            }
        }

    }

    commands(){
        return [
            new ContextMenuCommandBuilder()
                .setName(this.interaction_name)
                .setType(ApplicationCommandType.Message),
            new SlashCommandBuilder()
                .setName('help')
                .setDescription('Get help with this bot'),
        ]
    }

}