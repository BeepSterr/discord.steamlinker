import 'dotenv/config';
export default {

    "auth": {
        "app_id": process.env.DISCORD_APP_ID,
        "app_token": process.env.DISCORD_TOKEN
    },

    // Used for registering slash commands
    "guild_ids": [
        "850836877924761610"
    ],

    "modules": {

        // Allows you to assign an extra role if a member has
        // Any of the other roles, Useful to "combine" roles.
        "steamlinker": {
            "enabled": true,
            "steam_api_key": process.env.STEAM_API_KEY,
        },
    }

}
