class VKMethods {
    static executed = (callback) => (event) => {
        if (callback) {
            try {
                callback(JSON.parse(event.target.responseText));
            } catch (e) {}
        }
    };

    static getGroupChats = (groupToken, callback) => {
        var xhr = new XMLHttpRequest();
        xhr.open(
            "GET",
            `https://api.vk.com/method/messages.getConversations?access_token=${groupToken}&v=5.120`
        );
        xhr.onload = VKMethods.executed(callback);
        xhr.send();
    };

    static sendMessageToGroupChat = (groupToken, id, message, callback) => {
        var xhr = new XMLHttpRequest();
        xhr.open(
            "GET",
            `https://api.vk.com/method/messages.send?peer_id=${id}&message=${encodeURIComponent(
                message
            )}&access_token=${groupToken}&v=5.38`
        );
        xhr.onload = VKMethods.executed(callback);
        xhr.send();
    };

    static getUsersGroups = (id, token, callback) => {
        var xhr = new XMLHttpRequest();
        xhr.open(
            "GET",
            `https://api.vk.com/method/groups.get?user_id=${id}&filter=admin,editor,moder&extended=1&v=5.92&access_token=${token}`
        );
        xhr.onload = VKMethods.executed(callback);
        xhr.send();
    };
}

export default VKMethods;
