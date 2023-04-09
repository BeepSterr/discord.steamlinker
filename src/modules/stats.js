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
        client.on('guildCreate', this.GuildCountChange.bind(this))
        client.on('guildDelete', this.GuildCountChange.bind(this))

        this.GuildCountChange()

    }

    GuildCountChange(){
        console.log(`Guild Count: ${this.#client.guilds.cache.size}`);

        fetch(`https://top.gg/api/bots/${this.#config.bot_id}/stats`, {
            method: 'POST',
            headers: {
                'Authorization': this.#config.topgg_token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                server_count: this.#client.guilds.cache.size
            })
        }).then(r => r.json()).then(console.log)
    }

    commands(){
        return []
    }

}