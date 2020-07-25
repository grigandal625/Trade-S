/*global chrome*/

import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import RefreshIcon from "@material-ui/icons/Refresh";
import React from "react";
import VKMethods from "./VKMethods";
import Switch from "@material-ui/core/Switch";

class APIKeyDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = { key: "" };
    }

    onOk = () => {
        this.props.onOk(this.state.key);
    };

    onCancel = () => {
        this.props.onCancel();
    };

    keyChanged = (event) => {
        if (event.currentTarget) {
            var newKey = event.currentTarget.value;
            this.setState((state) => {
                state.key = newKey;
                return state;
            });
        }
    };

    render = () => {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.switchDialog}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle>Введите API-ключ группы</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Для обеспечения возможности отправки сообщений в чаты
                        необходимо указать API-ключ группы.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="API-ключ группы"
                        fullWidth
                        onChange={this.keyChanged}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.onOk} color="primary">
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };
}

class MessagesTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            platform: this.props.platform,
            openDialog: false,
            gotToken: false,
            loaded: false,
        };
    }

    build = () => {
        return this.state.platform != this.props.platform
            ? this.setState(
                  (state, props) => {
                      state.gotToken = false;
                      state.platform = props.platform;
                      state.loaded = false;
                      state.groupToken = undefined;
                      return state;
                  },
                  () => {
                      this.rebuild();
                  }
              )
            : this.rebuild();
    };

    rebuild = () => {
        return (
            !this.state.gotToken &&
            this.getMessages((platformMsg, setts) => {
                return (
                    platformMsg.groupToken &&
                    this.gotToken(platformMsg.groupToken, this.reload)
                );
            })
        );
    };

    openDialog = () => {
        this.setState((state) => {
            state.openDialog = true;
            return state;
        });
    };

    closeDialog = () => {
        this.setState((state) => {
            state.openDialog = false;
            return state;
        });
    };

    getMessages = (callback) => {
        var self = this;
        chrome.storage.local.get(["settsData"], (res) => {
            var r = res;
            var data = r.settsData != undefined ? r.settsData : {};
            data.messages = data.messages ? data.messages : [];
            data.messages[self.state.platform] = data.messages[
                self.state.platform
            ]
                ? data.messages[self.state.platform]
                : {};
            try {
                callback(data.messages[self.state.platform], data);
            } catch (e) {
                console.error("TradeS Error", e);
            }
        });
    };

    updateMessages = (token, toSend, toShow, callback) => {
        this.getMessages((platformMsg, setts) => {
            platformMsg.groupToken = token;
            platformMsg.toSend = toSend
                ? toSend
                : this.state.chats.filter((e) => e.selected).map((e) => e.id);
            platformMsg.toShow = toShow
                ? toShow
                : this.state.chats.filter((e) => e.shown).map((e) => e.id);
            setts.messages[this.props.platform] = platformMsg;
            chrome.storage.local.set({ settsData: setts }, () => {
                try {
                    callback(platformMsg, setts);
                } catch (e) {
                    console.error("TradeS Error", e);
                }
            });
        });
    };

    gotToken = (token, callback) => {
        this.getMessages((platformMsg, setts) => {
            this.updateMessages(
                token,
                platformMsg.toSend ? platformMsg.toSend : [],
                platformMsg.toShow ? platformMsg.toShow : [],
                () => {
                    this.setState(
                        (state) => {
                            state.gotToken = true;
                            state.groupToken = token;
                            state.openDialog = false;
                            return state;
                        },
                        () => {
                            try {
                                callback(token, platformMsg, setts);
                            } catch (e) {
                                console.error("TradeS Error", e);
                            }
                        }
                    );
                }
            );
        });
    };

    reload = () => {
        this.setState(
            (state) => {
                state.loaded = false;
                state.openDialog = false;
                state.chats = undefined;
                return state;
            },
            () => {
                this.load();
            }
        );
    };

    load = () => {
        this.getMessages((platformMsg, setts) => {
            var p = {
                groupToken: platformMsg.groupToken,
                toSend: platformMsg.toSend ? platformMsg.toSend : [],
                toShow: platformMsg.toShow ? platformMsg.toShow : [],
            };
            VKMethods.getGroupChats(p.groupToken, (result) => {
                if (result.error) {
                    alert(result);
                    console.log(result);
                }
                this.setState(
                    (state) => {
                        p.toSend = p.toSend ? p.toSend : [];
                        state.chats = result.response.items
                            .filter((c) => {
                                return c.conversation.peer.type == "chat";
                            })
                            .map((chat) => {
                                return {
                                    id: chat.conversation.peer.id,
                                    name: chat.conversation.chat_settings.title,
                                    selected: p.toSend.includes(
                                        chat.conversation.peer.id
                                    ),
                                    shown: p.toShow.includes(
                                        chat.conversation.peer.id
                                    ),
                                };
                            });
                        state.loaded = true;

                        return state;
                    },
                    () => {
                        this.updateMessages(platformMsg.groupToken);
                    }
                );
            });
        });
    };

    toSendChanged = (chat) => (event) => {
        chat.selected = !chat.selected;
        this.getMessages((platformMsg, setts) => {
            this.updateMessages(
                platformMsg.groupToken,
                this.state.chats
                    .filter((e) =>
                        e.id == chat.id ? chat.selected : e.selected
                    )
                    .map((e) => e.id),
                this.state.chats.filter((e) => e.shown).map((e) => e.id),
                () => {
                    this.setState((state) => {
                        state.chats = state.chats.map((e) => {
                            return e.id == chat.id ? chat : e;
                        });
                        return state;
                    });
                }
            );
        });
    };

    toShowChanged = (chat) => (event) => {
        chat.shown = !chat.shown;
        this.getMessages((platformMsg, setts) => {
            this.updateMessages(
                platformMsg.groupToken,
                this.state.chats.filter((e) => e.selected).map((e) => e.id),
                this.state.chats
                    .filter((e) => (e.id == chat.id ? chat.shown : e.shown))
                    .map((e) => e.id),
                () => {
                    this.setState((state) => {
                        state.chats = state.chats.map((e) => {
                            return e.id == chat.id ? chat : e;
                        });
                        return state;
                    });
                }
            );
        });
    };

    getChatRows = () => {
        return this.state.chats.map((e) => {
            return (
                <TableRow>
                    <TableCell>{e.name}</TableCell>
                    <TableCell>
                        <Switch
                            checked={e.selected}
                            color="primary"
                            onChange={this.toSendChanged(e)}
                        />
                    </TableCell>
                    <TableCell align="center">
                        <Switch
                            checked={e.shown}
                            color="primary"
                            onChange={this.toShowChanged(e)}
                        />
                    </TableCell>
                    <TableCell align="right">
                        <Button
                            onClick={() => {
                                this.getMessages((platformMsg) => {
                                    VKMethods.sendMessageToGroupChat(
                                        platformMsg.groupToken,
                                        e.id,
                                        "Тестовое сообщение"
                                    );
                                });
                            }}
                        >
                            Тестовое сообщение
                        </Button>
                    </TableCell>
                </TableRow>
            );
        });
    };

    getChatTable = () => {
        if (this.state.loaded) {
            return (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Чат</TableCell>
                                <TableCell>Отправка</TableCell>
                                <TableCell align="center">
                                    Отображение для Trade-S Lite
                                </TableCell>
                                <TableCell align="right">
                                    <Button onClick={this.reload}>
                                        <RefreshIcon />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{this.getChatRows()}</TableBody>
                    </Table>
                </TableContainer>
            );
        }
        return <CircularProgress style={{ padding: 20 }} />;
    };

    render = () => {
        this.build();
        if (this.state.gotToken) {
            return (
                <>
                    <List>
                        <ListItem button onClick={this.openDialog}>
                            <ListItemIcon>
                                <EditIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    this.state.groupToken.slice(0, 10) + "..."
                                }
                            />
                        </ListItem>
                    </List>
                    <APIKeyDialog
                        open={this.state.openDialog}
                        onCancel={this.closeDialog}
                        onOk={(token) => {
                            this.gotToken(token, this.reload);
                        }}
                    />
                    {this.getChatTable()}
                </>
            );
        } else if (this.state.gotToken != undefined) {
            return (
                <>
                    <List>
                        <ListItem button onClick={this.openDialog}>
                            <ListItemIcon>
                                <AddIcon />
                            </ListItemIcon>
                            <ListItemText primary={"Укажите API-ключ группы"} />
                        </ListItem>
                    </List>
                    <APIKeyDialog
                        open={this.state.openDialog}
                        onCancel={this.closeDialog}
                        onOk={(token) => {
                            this.gotToken(token, this.reload);
                        }}
                    />
                </>
            );
        }
        return <CircularProgress style={{ padding: 20 }} />;
    };
}

class PostsTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            platform: -1, //this.props.platform,
            groups: undefined,
        };
    }

    build = () => {
        return this.state.platform != this.props.platform
            ? this.reload()
            : undefined;
    };

    reload = () => {
        this.setState(
            (state) => {
                state.loaded = false;
                state.groups = undefined;
                state.platform = this.props.platform;
                return state;
            },
            () => {
                this.load();
            }
        );
    };

    load = () => {
        this.getPosts((posts, setts) => {
            var p = posts ? posts : {};
            VKMethods.getMyGroups((result) => {
                if (result.error) {
                    alert(result);
                    console.log(result);
                    return;
                }
                this.setState((state) => {
                    state.loaded = true;
                    state.groups = result.response.items.map(
                        (e) => {
                            return {
                                id: e.id,
                                name: e.name,
                                selected: p.toSend && p.toSend.includes(e.id),
                                shown: p.toShow && p.toShow.includes(e.id),
                            };
                        },
                        () => {
                            this.updatePosts(
                                this.state.groups
                                    .filter((e) => e.selected)
                                    .map((e) => e.id)
                            );
                        }
                    );
                    return state;
                });
            });
        });
    };

    getPosts = (callback) => {
        var cb = callback;
        var self = this;
        chrome.storage.local.get(["settsData"], (r) => {
            var posts =
                r.settsData.posts && r.settsData.posts[self.state.platform]
                    ? r.settsData.posts[self.state.platform]
                    : [];
            posts =
                posts.length != undefined
                    ? { toSend: posts, toShow: [] }
                    : posts;
            try {
                cb(posts, r.settsData);
            } catch (e) {
                console.error("TradeS Error", e);
            }
        });
    };

    updatePosts = (toSend, toShow, callback) => {
        this.getPosts((posts, setts) => {
            var cb = callback;
            setts.posts = setts.posts ? setts.posts : [];
            setts.posts[this.state.platform] = {
                toSend: toSend
                    ? toSend
                    : this.state.groups
                    ? this.state.groups
                          .filter((e) => e.selected)
                          .map((e) => e.id)
                    : [],
                toShow: toShow
                    ? toShow
                    : this.state.groups
                    ? this.state.groups.filter((e) => e.shown).map((e) => e.id)
                    : [],
            };
            chrome.storage.local.set({ settsData: setts }, () => {
                try {
                    cb(setts);
                } catch (e) {
                    console.error("TradeS Error", e);
                }
            });
        });
    };

    toSendChanged = (group) => (event) => {
        group.selected = !group.selected;

        this.updatePosts(
            this.state.groups
                .filter((e) => (e.id == group.id ? group.selected : e.selected))
                .map((e) => e.id),
            undefined,
            () => {
                this.setState((state) => {
                    state.loaded = true;
                    state.groups = state.groups.map((e) => {
                        return e.id == group.id ? group : e;
                    });
                    return state;
                });
            }
        );
    };

    toShowChanged = (group) => (event) => {
        group.shown = !group.shown;

        this.updatePosts(
            undefined,
            this.state.groups
                .filter((e) => (e.id == group.id ? group.shown : e.shown))
                .map((e) => e.id),
            () => {
                this.setState((state) => {
                    state.loaded = true;
                    state.groups = state.groups.map((e) => {
                        return e.id == group.id ? group : e;
                    });
                    return state;
                });
            }
        );
    };

    getGropuRows = () => {
        return this.state.groups.map((e) => {
            return (
                <TableRow>
                    <TableCell>{e.name}</TableCell>
                    <TableCell>
                        <Switch
                            checked={e.selected}
                            color="primary"
                            onChange={this.toSendChanged(e)}
                        />
                    </TableCell>
                    <TableCell align="center">
                        <Switch
                            checked={e.shown}
                            color="primary"
                            onChange={this.toShowChanged(e)}
                        />
                    </TableCell>
                    <TableCell align="right">
                        <Button
                            onClick={() => {
                                VKMethods.postOnMyGroupWall(
                                    e.id,
                                    "Тестовый пост"
                                );
                            }}
                        >
                            Тестовый пост
                        </Button>
                    </TableCell>
                </TableRow>
            );
        });
    };

    render = () => {
        this.build();
        if (this.state.loaded) {
            return (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Группа</TableCell>
                                <TableCell>Отправка</TableCell>
                                <TableCell align="center">
                                    Отображение для Trade-S Lite
                                </TableCell>
                                <TableCell align="right">
                                    <Button onClick={this.reload}>
                                        <RefreshIcon />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{this.getGropuRows()}</TableBody>
                    </Table>
                </TableContainer>
            );
        }
        return <CircularProgress style={{ padding: 20 }} />;
    };
}

export { MessagesTab, PostsTab };
