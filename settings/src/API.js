/*global chrome*/

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
        chrome.storage.local.get(["userId"], (r)=>{
            API.getUserById(r.userId, cb)
        })
    }

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

export default API;
