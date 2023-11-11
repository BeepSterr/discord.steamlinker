import 'dotenv/config';
import {default as SteamAPI} from "steamapi";
import {
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";
import Scraper from "steam.scraper";
const steam = new SteamAPI(process.env.STEAM_API_KEY);

export const prefix = 'https://api.awoo.industries/send?url='

export function getSteamURLS(text) {
    let match = text.match(/\b((https?|ftp|file):\/\/|(www|ftp)\.)[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/ig);
    return match ? match.map( item => { return new URL(item)}) : [];
}
export default async function urlToEmbed(url){

    switch(url.host){
        case 'steamcommunity.com':
            return await parseCommunity(url);
        case 'store.steampowered.com':
            return await parseStore(url);
    }

    return false;

}

async function parseCommunity(url){
    let parts = url.pathname.split('/');
    switch(parts[1]){

        case 'sharedfiles':


            const workshop_id = url.searchParams.get('id')
            if(!workshop_id) return false;

            const workshop_data = await Scraper.getWorkshopItem(url.href);

            const w_embed = new EmbedBuilder();
            w_embed.setTitle(workshop_data.title);
            w_embed.setDescription('```' + workshop_data.description+ '```');
            w_embed.setThumbnail(workshop_data.image);
            w_embed.setURL(`${prefix}steam://CommunityFilePage/${workshop_id}`);

            w_embed.addFields([
                { name: 'Tags', value: workshop_data.tags.map(x => `\`${x}\``).join(', '), inline: true },
                { name: 'Author', value: `[Steam Profile](${workshop_data.author})`, inline: true },
                // { name: 'Ratings', value: String(workshop_data.rating_total), inline: true },

            ])

            return {
                embed: w_embed.toJSON(),
                buttons: [new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${prefix}steam://CommunityFilePage/${workshop_id}`)
                    .setLabel(`Open "${workshop_data.title}" in Steam`)]
            };

        case 'id':
        case 'profiles':

            const profile_id = await steam.resolve(url.href);
            const profile_data = await Scraper.getUser(url.href);

            const embed = new EmbedBuilder();
            embed.setTitle(profile_data.nickname);
            embed.setDescription('```' + profile_data.summary + '```');
            embed.setThumbnail(profile_data.avatar);
            embed.setURL(`${prefix}steam://url/steamIdPage/${profile_id}`);

            embed.addFields(
                [
                    { name: 'Level', value: String(profile_data.stats.level), inline: true },
                    { name: 'Status', value: String(profile_data.status), inline: true },
                ]
            );

            // Banned state
            if(profile_data.bans.vac || profile_data.bans.game) {
                embed.addFields([
                    {
                        name: 'Bans',
                        value: `${profile_data.bans.vac ? 'Vac Banned\n' : ''} ${profile_data.bans.game > 0 ? 'Game Banned' : ''}`,
                        inline: false
                    }
                ]);
            }

            return {
                embed: embed.toJSON(),
                buttons: [new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${prefix}steam://url/steamIdPage/${profile_id}`)
                    .setLabel(`Open "${profile_data.nickname}" in Steam`)]
            };
    }

    return false;
}

async function parseStore(url){

    //https://store.steampowered.com/app/440/Team_Fortress_2/
    let parts = url.pathname.split('/');
    let app_id = parts[2];

    const store_data = await Scraper.getStorepage(url.href);

    const w_embed = new EmbedBuilder();
    w_embed.setTitle(store_data.name);
    // w_embed.setDescription('```' + store_data.description+ '```');
    w_embed.setImage(store_data.image);
    w_embed.setURL(`${prefix}steam://store/${app_id}`);

    w_embed.addFields([
        { name: 'Tags', value: store_data.tags.map(x => `\`${x}\``).join(', '), inline: true },

    ]);

    return {
        embed: w_embed.toJSON(),
        buttons: [new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(`${prefix}steam://store/${app_id}`)
            .setLabel(`Open "${store_data.name}" in Steam`)]
    };


}