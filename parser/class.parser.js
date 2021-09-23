const TypeProfile = require('./types/class.pt.profile');
const TypeWorkshop = require('./types/class.pt.workshop');

class SteamParser{

    static STEAM_DOMAINS = ['steamcommunity.com', 'store.steampowered.com']
    static TYPE_PROFILE = TypeProfile;
    static TYPE_WORKSHOP = TypeWorkshop;

    urls = [];
    valid = false;

    constructor(input) {

        var links = input.match(/\bhttps?:\/\/\S+/gi);

        if(links){
            for(let link of links) {
                let url = new URL(link);
                if(SteamParser.STEAM_DOMAINS.includes(url.hostname)){
                    this.urls.push(url);
                    this.valid = true;
                }
            }
        }

    }

    getType(){
        return this.urls.map( url => {
            switch(url.hostname){

                case "steamcommunity.com":
                    if (url.pathname.startsWith('/id')) {
                        return new SteamParser.TYPE_PROFILE(url);
                    }
                    if (url.pathname.startsWith('/sharedfiles/filedetails/')) {
                        return new SteamParser.TYPE_WORKSHOP(url)
                    }

            }
        })
    }



}

module.exports = SteamParser;