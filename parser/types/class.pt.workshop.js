const scrapeIt = require("scrape-it");
const decodeHTML = require('html-entities').decode;
const { MessageEmbed } = require('discord.js');

class Workshop {

    url;
    id;

    constructor(url) {
        this.url = url;
        this.id = url.search.replace('?id=', '');
    }

    getData(done){
        scrapeIt(this.url.toString(), {
            avatar: {
                selector: "#previewImageMain"
                , attr: "src"
            }
            , game: ".apphub_AppName"
            , coltest: ".subscribeText"
            , col_bg: ".CollectionBackgroundImage"
            , col_items: { listItem: ".workshopItemTitle"}
            , name: { selector: ".workshopItemDetailsHeader > .workshopItemTitle" }
            , description: ".workshopItemDescription"
            , ratings: { selector: ".numRatings" }
            , ratings_col: { selector: ".ratingSection" }
            , rating_stars: { selector: ".fileRatingDetails > img", attr: "src" }
            , big_image: { selector: "#previewImageMain", attr:"src" }
            , discussions: { selector: ".forum_topic " }
            , collection_count: ".parentCollectionsNumOthers > a"
            , collection_url: { selector: ".parentCollectionsNumOthers > a", attr:"href" }
        }).then(({ data, response }) => {
            const embed = new MessageEmbed();

            const is_collection = data.coltest === 'Subscribe to all';

            if(is_collection){
                data.ratings = data.ratings_col;
            }

            let desc = decodeHTML(data.description).replaceAll('<br>', '\n').substr(0, 200);
            if(desc.length === 200){
                desc += '...';
            }
            embed.setThumbnail(data.avatar);
            embed.setTitle(data.name);
            embed.setURL(this.url.toString());
            embed.setDescription(desc);

            // link
            embed.addField("<:480pxSteam_icon_logo:809876974067122186> Open In Steam", "steam://url/CommunityFilePage/" + this.id)

            // Rating
            if(data.rating_stars.includes('5-star')){ embed.addField("Rating :star::star::star::star::star:", data.ratings, true) }
            else if(data.rating_stars.includes('4-star')){ embed.addField("Rating :star::star::star::star:", data.ratings, true) }
            else if(data.rating_stars.includes('3-star')){ embed.addField("Rating :star::star::star:", data.ratings, true) }
            else if(data.rating_stars.includes('2-star')){ embed.addField("Rating :star::star:", data.ratings, true) }
            else if(data.rating_stars.includes('1-star')){ embed.addField("Rating :star:", data.ratings, true) }
            else if(data.rating_stars.includes('0-star')){ embed.addField("Rating", data.ratings, true) }
            else { embed.addField("Rating", "Not enough ratings.", true) }

            // collections
            if(is_collection) {

                if(data.col_items.length > 0){
                    let count = data.col_items.length;
                    let items = [];
                    if(count > 5){
                        count -= 5;
                        items.push(data.col_items[0])
                        items.push(data.col_items[1])
                        items.push(data.col_items[2])
                        items.push(data.col_items[3])
                        items.push(data.col_items[4])
                    }else{
                        items = data.col_items;
                    }

                    embed.addField("Collection Items", items.join('\n') + "\n... And " + count + " more")
                }

            }else{
                if(data.collection_count){
                    embed.addField("Collections", "["+data.collection_count+"]("+data.collection_url+")", true)
                }
            }


            done(embed);
        })
    }

}

module.exports = Workshop;