import Youtube from "./src/modules/youtube.js";

export default {

    "auth": {
        "app_id": process.env.APP_ID,
        "app_token": process.env.APP_TOKEN
    },

    // Used for registering slash commands
    "guild_ids": [
        "850836877924761610"
    ],

    "modules": {

        // Allows you to assign an extra role if a member has
        // Any of the other roles, Useful to "combine" roles.
        "rolemerge": {
            "enabled": true,
            "roles": [
                {
                    // Server ID for the afected server
                    "guild_id": "850836877924761610",

                    // Role to be granted to members.
                    "target": "851159125365751838",

                    // Any of these roles need to be applied to the member to grant the role
                    "sources": [
                        "977985733438615582",
                        "1012030432851795968",
                        "851156814623539252"
                    ]
                }
            ]
        },

        // Quickly dump some canned text in the channel.
        "canned_texts": {
            "enabled": false,
            "texts": {
                "asktoask": {
                    "title": "Just ask your question!",
                    "text": "No need to ask if you can ask a question, The channel exists for questions so just ask them!"
                },
                "java16": {
                    "title": "Outdated Java",
                    "text": "My plugins only work on servers with at least Java 16, Please make sure to update to a modern java version if you wish to use these plugins."
                },
                "suggest": {
                    "title": "Have a suggestion?",
                    "text": "Create a issue on the github repository of the thing you wanna make a suggestion for!"
                }
            }
        },

        "youtube": {
            "enabled": false,
            "api_key": process.env.YT_API_KEY,
            "channels": [
                {
                    "channel_id": "UCFgBYsKq3As4FGcp6HJ-DeQ",
                    "tags": {
                        "Short": "1033459059409571910",
                        "Upload": "1016017606060290059",
                        "Stream": "1011577268902035547"
                    },
                    "message": "Hey <@&{{tag_id}}>, something new has showed up!",
                    "send_in": "1013471805933101178",
                    "types": [Youtube.VIDEO_TYPE_SHORT, Youtube.VIDEO_TYPE_UPLOAD, Youtube.VIDEO_TYPE_STREAM]
                }
            ]
        },

        "autothread": {
            "enabled": true,
            "channels": [
                "1085546442233479238",
                // "1085604815595389019"
            ]
        },

        "threadutils": {
            "enabled": false,
            "reasons": {
                "resolved": "The thread's topic was resolved. If you need more help, Please create a new thread.",
                "invalid": "The thread's topic does not belong here.",
                "derailed": "The thread got derailed from its original topic.",
                "generic": "The thread was closed by a moderator.",
            },
            "createmessage": {
                "977962827010699274": {
                    "title": "Get quicker support!",
                    "body": "- Check your issue in the [Common Issues List](https://beeps.notion.site/Troubleshooting-5bec071fa1bd459497c4fb3af5df6584)\n- Send your config.yml here\n- Send your list of plugins",
                }
            }
        },

        "gameservers": {
            "enabled": true,
            "udp_port": 13337,
            "update_interval": 1000 * 30,
            "guild_id": "850836877924761610",
            "channel_id": "1085592890304122900",
            "servers": [
                {
                    "address": "78.141.211.251",
                    "port": '27015',
                    "message_id": "1085613625164701726",
                    "type": "tf2"
                },
                {
                    "address": "78.141.211.251",
                    "port": '27016',
                    "message_id": "1086599909614034984",
                    "type": "tf2"
                }
            ]
        }

    }

}
