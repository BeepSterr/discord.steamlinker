import {
    AutocompleteInteraction,
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandStringOption
} from "discord.js";

import Gamedig from "gamedig";

export default class Gameservers {

    command_name = 'server';
    channel = null;

    checker;

    #client;
    #config;

    /**
     * @param client discord.js.Client
     * @param moduleConfig Object
     */
    constructor(client, moduleConfig){

        this.#client = client;
        this.#config = moduleConfig;

        this.checker = new Gamedig({
            listenUdpPort: this.#config.udp_port
        })

        client.guilds.fetch(this.#config.guild_id).then( (guild) => {
            guild.channels.fetch(this.#config.channel_id).then( (channel) => {
                this.channel = channel;

                setInterval(this.updateServers.bind(this), this.#config.update_interval);
                this.updateServers();

            })
        });


        // Register Events
        client.on('interactionCreate', this.handleCommand.bind(this))


    }

    async updateServers(){
        for(let server of this.#config.servers){
            await this.updateServerInfo(server);
        }
    }

    async updateServerInfo(server) {

        this.checker.query({
            type: server.type,
            host: server.address,
            port: server.port
        }).then(async (state) => {

            let embed = new EmbedBuilder();
            embed.setTitle(state.name);

            const gamers = [...state.players, ...state.bots].sort((a, b) => {
                return a.raw.time > b.raw.time
            });

            embed.addFields({
                    name: 'Player Count',
                    value: `${state.players.length+state.bots.length}/${state.maxplayers}`,
                    inline: true
                }, {
                    name: 'Map',
                    value: state.map,
                    inline: true
            });

            if(['tf2', 'csgo'].includes(server.type)){
                embed.addFields({
                    name: 'Click to join',
                    value: `steam://connect/${server.address}:${server.port}`,
                    inline: false
                });
            }

            if(gamers.length > 0){
                embed.addFields({
                    name: "Players",
                    value: '```' + gamers.map(player => player.name).join('\n') + '```',
                    inline: false
                });
            }

            // get the map image
            embed.setThumbnail(`https://image.gametracker.com/images/maps/160x120/tf2/${state.map}.jpg`)


            let message = await this.channel.messages.fetch(server.message_id);
            message.edit({content: '', embeds: [embed.toJSON()]});

        }).catch(async (error) => {
            let embed = new EmbedBuilder();
            embed.setTitle('Server is offline or not responding');

            if (['tf2', 'csgo'].includes(server.type)) {
                embed.addFields({
                    name: 'Click to join',
                    value: `steam://connect/${server.address}:${server.port}`,
                    inline: false
                });
            }

            let message = await this.channel.messages.fetch(server.message_id);
            message.edit({content: '', embeds: [embed.toJSON()]});

        });

    }

    async handleCommand(interaction) {

        // Command Execution
        if (interaction instanceof CommandInteraction && interaction.commandName === this.command_name) {
        } else if (interaction instanceof CommandInteraction && interaction.commandName === 'aye') {
            interaction.reply('https://www.youtube.com/watch?v=cPXQDR6o3Kg', {ephemeral: true});
        }
        else if (interaction instanceof CommandInteraction && interaction.commandName === 'createmessage') {
            (await interaction.channel.fetch()).send('message');
        }

        // Autocomplete
        else if (interaction instanceof AutocompleteInteraction) {

            let options = []
            for (let key of Object.keys(this.#config.texts)) {
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
                .setName(this.command_name)
                .setDescription('Get information about a server'),
            new SlashCommandBuilder()
                .setName('aye')
                .setDescription('me bottle o scrumpy'),
            new SlashCommandBuilder()
                .setName('createmessage')
                .setDescription('create a message for testing')
        ]
    }


}