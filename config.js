import 'dotenv/config';
export default {

    "auth": {
        "app_id": process.env.DISCORD_APP_ID,
        "app_token": process.env.DISCORD_TOKEN
    },

    // Used for registering slash commands
    "guild_ids": [
        "1124974598841171998"
    ],

    "modules": {

        "steamlinker": {
            "enabled": true,
            "steam_api_key": process.env.STEAM_API_KEY,
            "opted_out_users": [

            ]
        },

        "stats": {
            "enabled": true,
            "bot_id": process.env.DISCORD_APP_ID,
            "topgg_token": process.env.TOPGG_TOKEN,
        }
    }

}
