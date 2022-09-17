import {
    SlashCommandBuilder,
    SlashCommandStringOption,
    EmbedBuilder,
    ButtonInteraction,
    AutocompleteInteraction,
    CommandInteraction, ThreadChannel, ButtonBuilder, ActionRowBuilder, SlashCommandChannelOption, ChannelType
} from "discord.js";
import {ButtonStyle, PermissionFlagsBits} from "discord-api-types/v10";

export default class ThreadUtils {

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
        client.on('interactionCreate', this.handleInteraction.bind(this))
        client.on('threadCreate', this.sendNewThreadMessage.bind(this))

    }

    handleInteraction(interaction){
        if(interaction instanceof ButtonInteraction){
            this.handleButton(interaction);
        }
        if(interaction instanceof CommandInteraction){
            this.handleCommand(interaction);
        }
        if(interaction instanceof AutocompleteInteraction){
            this.handleAutocomplete(interaction);
        }
    }

    async handleCommand(interaction) {

        if(interaction.commandName !== 'thread') return;

        if (!(interaction.channel instanceof ThreadChannel)) {
            interaction.reply({content: '`⚠ Not a thread.`', ephemeral: true});
            return;
        }

        switch (interaction.options.getSubcommand()) {
            case 'lock':
                this.lockThread(interaction);
                break;
            case 'move':
                this.moveThread(interaction);
                break;
            default:
                interaction.reply({content: '`⚠ Unknown Command.`', ephemeral: true});
                return;
        }

    }

    handleAutocomplete(interaction){

        const focusedOption = interaction.options.getFocused(true);
        console.log(focusedOption);

        let options = []
        switch(focusedOption.name){
            case "reason": {
                for(let key of Object.keys(this.#config.reasons)){
                    options.push({
                        name: key,
                        value: this.#config.reasons[key]
                    })
                }
                break;
            }
        }


        interaction.respond(options);
    }

    handleButton(){
        // TODO: buttons lmao;
    }

    async lockThread(interaction){

        await interaction.channel.join();


        let embed = new EmbedBuilder();
        embed.setTitle(`Thread closed`);
        embed.setDescription(interaction.options.get('reason').value);

        await interaction.reply({ embeds: [embed.toJSON()] })
        await interaction.channel.setLocked(true, interaction.options.get('reason').value);
        await interaction.channel.setArchived(true, interaction.options.get('reason').value);

    }

    async moveThread(interaction){

        await interaction.channel.join();

        const target = interaction.options.get('channel').channel;

        let newThread = await target.threads.create({
            name: interaction.channel.name,
            autoArchiveDuration: 60,
            reason: `moved by ${interaction.member.id} (${interaction.member.user.name})`,
        });

        for(let member in interaction.channel.members.cache){
            newThread.members.add(member);
        }

        interaction.channel.setName(`[MOVED] ${interaction.channel.name}`);

        let embed = new EmbedBuilder();
        embed.setTitle(`Thread moved`);
        embed.setDescription(`Thread was moved to <#${newThread.id}>`);

        await interaction.reply({ embeds: [embed.toJSON()] })

        embed.setDescription(`Thread was moved here from <#${interaction.channel.id}>`);
        await newThread.send({ embeds: [embed.toJSON()] })
        await interaction.channel.setLocked(true);
        await interaction.channel.setArchived(true);

    }

    /**
     *
     * @param thread ThreadChannel
     * @returns {Promise<void>}
     */
    async sendNewThreadMessage(thread){

        if(thread.ownerId === this.#client.user.id){
            return;
        }

        await thread.join();


        let tcm = this.#config.createmessage[thread.parentId];

        if(tcm === undefined){
            return false
        }

        // embed
        let embed = new EmbedBuilder();
        embed.setTitle(tcm.title);
        embed.setDescription(tcm.body);

        await thread.send({ embeds: [embed.toJSON()]});
    }
    commands(){
        return [
            new SlashCommandBuilder()
                .setName('thread')
                .setDescription('Thread Utilities')
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)

                .addSubcommand(subcommand => {
                    subcommand.addStringOption(new SlashCommandStringOption()
                        .setName('reason')
                        .setDescription('A Reason')
                        .setRequired(true)
                        .setAutocomplete(true)
                    ).setName('lock').setDescription('Lock & Archive the thread');

                    return subcommand;
                })

                .addSubcommand(subcommand => {
                    subcommand.addChannelOption(new SlashCommandChannelOption()
                        .setName('channel')
                        .setDescription('Target Channel')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                    ).setName('move').setDescription('Move thread to other channel');

                    return subcommand;
                })
        ]
    }

}