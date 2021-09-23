const {MessageEmbed} = require("discord.js");

class Profile {

    url;

    constructor(url) {
        this.url = url;
    }

    getData(done){

        const embed = new MessageEmbed();
        done(embed);

    }

}

module.exports = Profile;