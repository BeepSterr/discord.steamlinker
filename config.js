export default {

    "auth": {
        "app_id": process.env.APP_ID,
        "app_token": process.env.APP_TOKEN
    },

    // Used for registering slash commands
    "guild_ids": [
        "850836877924761610",
        "543661757974183960"
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
            "enabled": true,
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
            "enabled": true,
            "api_key": process.env.YT_API_KEY
        },

        "threadutils": {
            "enabled": true,
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
        }

    }

}