module.exports = {

    "auth": {
        "app_id": "xxxx",
        "app_token": "xxxx"
    },

    // Used for registering slash commands
    "guild_id": "850836877924761610",

    "modules": {

        // Allows you to assign a extra role if a member has
        // Any of the other roles, Useful if you want to "combine" roles.
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
                        "851156814623539252",
                        "977965406289547264",
                        "977985733438615582"
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
        }

    }

}