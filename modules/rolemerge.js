module.exports = class Rolemerge {

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
        client.on('guildMemberUpdate', this.memberUpdated.bind(this))

    }

    memberUpdated(oldMember, newMember){

        const rolesConfig = this.#config.roles;
        for(let roleConfig of rolesConfig){

            if(roleConfig.guild_id !== newMember.guild.id){
                continue;
            }

            if(newMember.roles.cache.hasAny(...roleConfig.sources)){
                console.log(`Adding role ${roleConfig.target} to ${newMember.user.username}`);
                newMember.roles.add(roleConfig.target);
            }else{
                if(newMember.roles.cache.has(roleConfig.target)){
                    console.log(`Removing role ${roleConfig.target} from ${newMember.user.username}`);
                    newMember.roles.remove(roleConfig.target);
                }
            }
        }

    }

}