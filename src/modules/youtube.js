import {
    SlashCommandBuilder,
    SlashCommandStringOption,
    EmbedBuilder,
    AutocompleteInteraction,
    CommandInteraction, ButtonInteraction, ActionRowBuilder, ButtonBuilder
} from "discord.js";
import YouTube from "popyt";
import {ButtonStyle} from "discord-api-types/v10";
import ytdl from "ytdl-core";
import fs from "fs";
import * as Path from "path"
import fetch, {fileFromSync, FormData} from 'node-fetch';

export default class Youtube {

    #client;
    #config;

    #yt;

    static tempdir = Path.resolve('./', 'temp')
    static url_regex = /(?:(?:v|vi|be|videos|embed|shorts)\/(?!videoseries)|(?:v|ci)=)([\w-]{11})/i;

    /**
     * @param client discord.js.Client
     * @param moduleConfig Object
     */
    constructor(client, moduleConfig){

        this.#client = client;
        this.#config = moduleConfig;

        // Register Events
        client.on('interactionCreate', this.handleInteraction.bind(this))

        this.#yt = new YouTube.YouTube(moduleConfig.api_key);

    }

    handleInteraction(interaction){

        if(interaction instanceof ButtonInteraction){
            this.handleButton(interaction);
        }
        if(interaction instanceof CommandInteraction){
            this.handleCommand(interaction);
        }
    }

    handleCommand(interaction){

        if (interaction.commandName !== 'yt') return;

        switch(interaction.options.getSubcommand()){
            case 'get':
                this.getVideo(interaction); break;
            default:
                interaction.reply({ content: 'Unknown command', ephemeral: true});
        }

    }

    async handleButton(interaction) {

        interaction.deferReply({ephemeral: true });

        const data = interaction.customId.split(':');
        const command = data[0];
        const mode = data[1];
        const vid = data[2];

        if (command !== 'ytdl') return;

        let info = await ytdl.getInfo(vid);
        let chosen_format = ytdl.chooseFormat(info.formats, {
            quality: mode === 'mp3' ? 'highestaudio' : 'highest'
        })

        const filename = vid + (mode === 'mp4' ? '.mp4' : '.mp3');
        let file = Path.resolve(Youtube.tempdir, filename);
        if(!fs.existsSync(Youtube.tempdir)){
            fs.mkdirSync(Youtube.tempdir);
        }

        //await interaction.deferReply({ ephemeral: true });
        const stream = ytdl.downloadFromInfo( info, { format: chosen_format}).pipe(fs.createWriteStream(file));

        stream.on('finish',  async () => {

            const formData = new FormData()
            const fileu = fileFromSync(file, filename)

            formData.set('file', fileu, 'filename');

            const response = await fetch('https://awoo.download/upload', { method: 'POST', body: formData, headers: {'Authorization': 'catboygaming'} })
            const data = await response.json()

            console.log(data);
            interaction.editReply({ ephemeral: true, content: data.url });

        });



    }

    async getVideo(interaction){

        const url_data = interaction.options.getString('url').match(Youtube.url_regex);
        const video_id = url_data[1] ? url_data[1] : undefined;

        if(!video_id){
            interaction.reply({ content: 'Could not parse video URL.', ephemeral: true});
        }

        const x = await this.#yt.getVideo(video_id);

        let embed = new EmbedBuilder();
        embed.setTitle(x.title);
        embed.setDescription(x.description);
        embed.setURL(x.url);

        if(x.thumbnails['maxres']){
            embed.setThumbnail(x.thumbnails['maxres'].url)
        }else if(x.thumbnails['high']) {
            embed.setThumbnail(x.thumbnails['high'].url)
        }else if(x.thumbnails['default']) {
            embed.setThumbnail(x.thumbnails['default'].url)
        }

        embed.setAuthor({ name: x.channel.name, url:`https://youtube.com/channel/${x.channel.id})`})

        embed.addFields(

            { name: 'Views', value: x.views.toLocaleString(), inline :true},
            { name: 'Likes', value: x.likes.toLocaleString(), inline :true},

            { name: 'Uploaded On', value: `<t:${new Date(x.datePublished).getTime() / 1000}>`},
            { name: 'Tags', value: x.tags.join(', ')},

        )

        embed.setTimestamp(new Date());

        const id_dlmp4 = `ytdl:mp4:${video_id}`;
        const id_dlmp3 = `ytdl:mp3:${video_id}`;

        // buttons
        const row = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId(id_dlmp4)
                .setLabel('Get Video (MP4)')
                .setEmoji({ name: 'YouTube', id: '1012043253895409706'})
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId(id_dlmp3)
                .setLabel('Get Audio (MP3)')
                .setEmoji({ name: 'YouTube', id: '1012043253895409706'})
                .setStyle(ButtonStyle.Danger)
        );

        interaction.reply({ embeds: [embed.toJSON()], ephemeral: true, components: [row.toJSON()]});

    }

    commands(){
        return [
            new SlashCommandBuilder()
                .setName('yt')
                .setDescription('Get data from YouTube')
                .addSubcommand(subcommand => {
                    subcommand.addStringOption(new SlashCommandStringOption()
                        .setName('url')
                        .setDescription('Video URL')
                        .setRequired(true)
                    ).setName('get').setDescription('Get video by id / url');

                    return subcommand;
                })
        ]
    }

}