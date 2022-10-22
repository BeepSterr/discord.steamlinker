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
import * as util from "util";

const YoutubeMostRecentMap = new Map();


export default class Youtube {

    static VIDEO_TYPE_SHORT = 'Short';
    static VIDEO_TYPE_STREAM = 'Stream';
    static VIDEO_TYPE_UPLOAD = 'Upload';

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
        this.checkUpdateMap();
        setInterval( this.checkUpdateMap.bind(this), 1000 * 60 * 10)

    }

    async checkUpdateMap() {

        for (let ch of this.#config.channels) {

            // Channel ID but instead of UC use UU to get uploads playlist
            const playlist_videos = await this.#yt.getPlaylistItems('UU' + ch.channel_id.slice(2), 1);
            const most_recent_video = playlist_videos[0];

            if(!YoutubeMostRecentMap.has(ch.channel_id)){
                YoutubeMostRecentMap.set(ch.channel_id, most_recent_video.id);
            }

            if(most_recent_video.id !== YoutubeMostRecentMap.get(ch.channel_id)){
                YoutubeMostRecentMap.set(ch.channel_id, most_recent_video.id);
                await this.sendUploadUpdate(ch, most_recent_video.id);
            }

        }

    }

    async sendUploadUpdate(yt_channel, video_id) {

        const v = await this.#yt.getVideo(video_id);
        const video = await this.videoFixerUpper(v);

        if(yt_channel.types.includes(video.video_type)){

            if(yt_channel.send_in){
                const channel = await this.#client.channels.fetch(yt_channel.send_in)
                await channel.send({embeds: this.getVideoEmbed(video), content: yt_channel.message.replace('{{tag_id}}', yt_channel.tags[video.video_type])});
            }
        }

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

        try{

            let info = await ytdl.getInfo(vid);
            let chosen_format = ytdl.chooseFormat(info.formats, {
                quality: mode === 'mp3' ? 'highestaudio' : 'highest',
                filter: mode === 'mp3' ? 'audioonly' : 'audioandvideo'
            })

            const filename = vid + (mode === 'mp4' ? '.mp4' : '.mp3');
            let file = Path.resolve(Youtube.tempdir, filename);
            if(!fs.existsSync(Youtube.tempdir)){
                fs.mkdirSync(Youtube.tempdir);
            }

            await interaction.editReply({ ephemeral: true, content: '(1/2) `Downloading...`' });

            //await interaction.deferReply({ ephemeral: true });
            const stream = ytdl.downloadFromInfo( info, { format: chosen_format}).pipe(fs.createWriteStream(file));

            stream.on('')

            stream.on('finish',  async () => {

                const formData = new FormData()
                const fileu = fileFromSync(file)

                await interaction.editReply({ ephemeral: true, content: '(2/2) `Uploading...`' });

                formData.set('file', fileu, filename);

                const response = await fetch('https://awoo.download/upload', { method: 'POST', body: formData, headers: {'Authorization': 'catboygaming'} })
                const data = await response.json()

                console.log(data);
                interaction.editReply({ ephemeral: true, content: data.url });

            });
        }catch(ex){
            interaction.editReply({ ephemeral: true, content: 'Something went wrong while processing your request: ' + ex.message });
        }

    }

    async getVideo(interaction){

        const url_data = interaction.options.getString('url').match(Youtube.url_regex);
        const video_id = url_data[1] ? url_data[1] : undefined;

        if(!video_id){
            interaction.reply({ content: 'Could not parse video URL.', ephemeral: true});
        }

        const x = await this.#yt.getVideo(video_id);
        const video = await this.videoFixerUpper(x);

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

        interaction.reply({ embeds: this.getVideoEmbed(video), ephemeral: true, components: [row.toJSON()]});

    }

    getVideoEmbed(video){

        let embed = new EmbedBuilder();
        embed.setTitle(`(${video.video_type}) ${video.title}`);
        embed.setDescription(video.description);
        embed.setURL(Youtube.VIDEO_TYPE_SHORT === video.video_type ? `https://youtube.com/shorts/${video.id}` : video.url);


        if(video.thumbnails['maxres']){
            embed.setThumbnail(video.thumbnails['maxres'].url)
        }else if(video.thumbnails['high']) {
            embed.setThumbnail(video.thumbnails['high'].url)
        }else if(video.thumbnails['default']) {
            embed.setThumbnail(video.thumbnails['default'].url)
        }

        //embed.setAuthor({ name: video.channel.name, url: 'https://www.youtube.com/beepsterr' })

        embed.addFields(
            { name: 'Views', value: video.views.toLocaleString(), inline :true},
            { name: 'Likes', value: video.likes.toLocaleString(), inline :true},
            { name: 'Uploaded On', value: `<t:${new Date(video.datePublished).getTime() / 1000}>`, inline :true},
        )

        embed.setTimestamp(new Date());

        return [embed.toJSON()];
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

    async videoFixerUpper(video) {

        // set video type.
        video.video_type = (video.liveStatus === false ? Youtube.VIDEO_TYPE_UPLOAD : Youtube.VIDEO_TYPE_STREAM);

        // Check if video is a short
        const res = await fetch(`https://yt.lemnoslife.com/videos?part=short&id=${video.id}`);
        const json = await res.json();

        const vid_js = json.items[0];
        const short = vid_js.short.available;

        if(short){
            video.video_type = Youtube.VIDEO_TYPE_SHORT;
        }

        return video;

    }

}