class API {
    static recieved = (callback) => (event) => {
        try {
            callback(JSON.parse(event.currentTarget.responseText));
        } catch (e) {}
    };

    static authorize = (id, token, callback) => {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://trades.pythonanywhere.com/api");
        var obj = {
            method: "auth",
            data: { id: id, token: token },
        };
        xhr.onload = API.recieved(callback);
        xhr.send(JSON.stringify(obj));
    };

    static getUserById = (id, callback) => {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://trades.pythonanywhere.com/api");
        var obj = {
            method: "user",
            data: { id: id },
        };
        xhr.onload = API.recieved(callback);
        xhr.send(JSON.stringify(obj));
    };

    static getUserByKey = (key, callback) => {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://trades.pythonanywhere.com/api");
        var obj = {
            method: "user",
            data: { key: key },
        };
        xhr.onload = API.recieved(callback);
        xhr.send(JSON.stringify(obj));
    };

    static getMyData = (callback) => {
        var cb = callback;
        chrome.storage.local.get(["userId"], (r) => {
            API.getUserById(r.userId, cb);
        });
    };

    static setUserSetts = (id, setts, callback) => {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://trades.pythonanywhere.com/api");
        var obj = {
            method: "setts",
            data: { id: id, setts: setts },
        };
        xhr.onload = API.recieved(callback);
        xhr.send(JSON.stringify(obj));
    };

    static setUserSettsByKey = (key, setts, callback) => {
        API.getUserByKey(key, (resp) => {
            API.setUserSetts(resp.id, setts, callback);
        });
    };

    static uploadMySetts = (callback) => {
        var cb = callback;
        chrome.storage.local.get(["settsData", "userId"], (res) => {
            var r = res;
            if (r.userId && r.settsData) {
                var setts = {
                    accessToken: r.settsData.accessToken
                        ? r.settsData.accessToken
                        : undefined,
                    messages: r.settsData.messages
                        ? r.settsData.messages.map((e) => {
                              return {
                                  groupToken: e.groupToken
                                      ? e.groupToken
                                      : undefined,
                              };
                          })
                        : undefined,
                };
                API.setUserSetts(r.userId, setts, cb);
            }
        });
    };

    static downloadMySetts = (callback) => {
        var cb = callback;
        chrome.storage.local.get(["settsData", "userId"], (res) => {
            var r = res;
            if (r.userId) {
                API.getUserById(r.userId, (user) => {
                    var setts = r.settsData ? r.settsData : {};
                    setts.messages = user.setts.messages
                        ? user.setts.messages.map((e, i) => {
                              e.toSend =
                                  setts.messages &&
                                  setts.messages[i] &&
                                  setts.messages[i].toSend
                                      ? setts.messages[i].toSend
                                      : [];
                              return e;
                          })
                        : [];
                    setts.accessToken = user.setts.accessToken;
                    chrome.storage.local.set({ settsData: setts }, () => {
                        try {
                            cb(setts);
                        } catch (e) {}
                    });
                });
            }
        });
    };
}

var getParameterByName = (name, url) => {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[#?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

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

    static getMyGroups = (callback) => {
        var cb = callback;
        chrome.storage.local.get(["settsData", "userId"], (res) => {
            var r = res;
            VKMethods.getUsersGroups(r.userId, r.settsData.accessToken, cb);
        });
    };

    static postOnGroupWall = (groupId, token, message, callback) => {
        var xhr = new XMLHttpRequest();
        xhr.open(
            "POST",
            `https://api.vk.com/method/wall.post?owner_id=-${groupId}&from_group=1&message=${message}&signed=1&v=5.120&access_token=${token}`,
            true
        );
        xhr.onload = VKMethods.executed(callback);
        xhr.send();
    };

    static postOnMyGroupWall = (groupId, message, callback) => {
        var cb = callback;
        var id = groupId;
        var m = message;
        chrome.storage.local.get(["settsData"], (res) => {
            var r = res;
            VKMethods.postOnGroupWall(id, r.settsData.accessToken, m, cb);
        });
    };
}

chrome.tabs.onUpdated.addListener((id, info, tab) => {
    var activeTabId = tab.id;
    var url = tab.url.toString();
    chrome.storage.local.get(["TRSVkLogin", "settsData"], (r) => {
        if (
            r.TRSVkLogin &&
            url.indexOf("https://oauth.vk.com/blank.html#access_token=") != -1
        ) {
            try {
                chrome.tabs.remove(activeTabId, function () {});
            } catch (e) {}
            var token = getParameterByName("access_token", url);
            var userId = getParameterByName("user_id", url);
            API.authorize(userId, token, () => {
                chrome.storage.local.set(
                    { userId: userId, TRSVkLogin: false },
                    () => {
                        API.downloadMySetts(() => {
                            chrome.runtime.sendMessage(
                                {
                                    userId: userId,
                                    accessToken: token,
                                    extension: "TradeS",
                                },
                                (r) => {}
                            );
                        });
                    }
                );
            });
        }
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message && request.extension == "TradeS") {
        sendResponse({});
        var t = request.message.text;
        var c = request.message.chats;
        var g = request.message.groups;
        var p = request.message.platform;
        chrome.storage.local.get(["settsData"], (r) => {
            var data = r.settsData ? r.settsData : {};
            if (c) {
                var ms =
                    data.messages && data.messages[p] ? data.messages[p] : {};
                if (ms.groupToken) {
                    var token = ms.groupToken;
                    ms.toSend.map((id) => {
                        return VKMethods.sendMessageToGroupChat(token, id, t);
                    });
                }
            }
            if (g) {
                var ps = data.posts && data.posts[p] ? data.posts[p] : [];
                ps.map((id) => {
                    return VKMethods.postOnMyGroupWall(id, t);
                });
            }
        });
    }
});
