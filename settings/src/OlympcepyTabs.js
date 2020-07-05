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
import Switch from '@material-ui/core/Switch';

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
        this.state = { openDialog: false };
    }

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

    loadChats = () => {
        if (this.state.renderedPlatform != this.props.platform) {
            this.load();
        }
    };

    reload = () => {
        this.setState((state, props) => {
            state.hasToken = undefined;
            state.renderedPlatform = -1;
            return state;
        });
    };

    load = () => {
        var self = this;
        chrome.storage.local.get(["settsData"], (res) => {
            var r = res;
            if (
                r.settsData != undefined &&
                r.settsData.messages &&
                r.settsData.messages[this.props.platform] &&
                r.settsData.messages[this.props.platform].groupToken
            ) {
                self.gotToken(
                    r.settsData.messages[this.props.platform].groupToken
                );
            } else {
                self.setState((state, props) => {
                    state.settsData = r.settsData;
                    state.renderedPlatform = props.platform;
                    state.hasToken = false;
                    state.groupToken = undefined;
                    return state;
                });
            }
        });
    };

    tokenRecieved = (token) => {
        this.gotToken(token, this.reload);
    };

    gotToken = (token, callback) => {
        var self = this;
        var t = token;
        var cb = callback;
        chrome.storage.local.get(["settsData"], (res) => {
            var r = res;
            var data = r.settsData != undefined ? r.settsData : {};
            data.messages = data.messages ? data.messages : [];
            data.messages[self.props.platform] = data.messages[
                self.props.platform
            ]
                ? data.messages[self.props.platform]
                : {};
            data.messages[self.props.platform].groupToken = t;
            data.messages[self.props.platform].toSend = data.messages[
                self.props.platform
            ].toSend
                ? data.messages[self.props.platform].toSend
                : [];
            chrome.storage.local.set({ settsData: data }, () => {
                self.setState(
                    (state, props) => {
                        state.settsData = r.settsData;
                        state.renderedPlatform = props.platform;
                        state.hasToken = true;
                        state.groupToken = t;
                        state.openDialog = false;
                        return state;
                    },
                    () => {
                        try {
                            cb();
                        } catch (e) {}
                    }
                );
            });
        });
    };

    render = () => {
        this.loadChats();
        if (this.state.hasToken == undefined) {
            return <CircularProgress style={{ padding: 20 }} />;
        } else if (this.state.hasToken) {
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
                        onOk={this.tokenRecieved}
                    />
                    <ChatSelector
                        platform={this.props.platform}
                        token={this.state.groupToken}
                        data={this.state.settsData}
                        tab={this}
                    />
                </>
            );
        } else {
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
                        onOk={this.gotToken}
                    />
                </>
            );
        }
    };
}

class ChatSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loaded: false, renderedPlatform: props.platform };
        this.loadChats();
    }

    loadChats = () => {
        if (this.props.platform != -1) {
            VKMethods.getGroupChats(this.props.token, this.chatsRecieved);
        }
    };

    chatsRecieved = (result) => {
        if (result.error) {
            alert(result);
            console.log(result);
            this.setState((state) => {
                state.loaded = false;
                return state;
            });
            return;
        }
        var chats = result.response.items
            .filter((e) => e.conversation.peer.type == "chat")
            .map((e) => {
                return {
                    name: e.conversation.chat_settings.title,
                    id: e.conversation.peer.id,
                };
            });
        var self = this;
        chrome.storage.local.get(["settsData"], (res) => {
            var r = res;
            var data = r.settsData ? r.settsData : {};
            data.messages = data.messages ? data.messages : [];

            data.messages[self.props.platform] = data.messages[
                self.props.platform
            ]
                ? data.messages[self.props.platform]
                : {};

            data.messages[self.props.platform].toSend = data.messages[
                self.props.platform
            ].toSend
                ? data.messages[self.props.platform].toSend
                : [];

            var selected = data.messages[self.props.platform].toSend;
            self.updateChats(
                chats.map((c) => {
                    c.selected = selected.includes(c.id);
                    return c;
                })
            );
        });
    };

    updateChats = (cs) => {
        var chats = cs;
        var self = this;
        chrome.storage.local.get(["settsData"], (res) => {
            var r = res;
            var data = r.settsData ? r.settsData : {};
            data.messages = data.messages ? data.messages : [];

            data.messages[self.props.platform] = data.messages[
                self.props.platform
            ]
                ? data.messages[self.props.platform]
                : {};

            data.messages[self.props.platform].toSend = chats
                .filter((e) => e.selected)
                .map((e) => e.id);

            chrome.storage.local.set({ settsData: data }, () => {
                self.setState((state, props) => {
                    state.renderedPlatform = props.platform;
                    state.loaded = true;
                    state.chats = chats;
                    return state;
                });
            });
        });
    };

    toSendChanged = (c) => (event) => {
        var chat = c;
        this.updateChats(
            this.state.chats.map((e) => {
                e.selected = e.id != chat.id ? e.selected : !chat.selected;
                return e;
            })
        );
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
                    <TableCell align="right">
                        <Button
                            onClick={() => {
                                console.log('sending')
                                VKMethods.sendMessageToGroupChat(
                                    this.props.token,
                                    e.id,
                                    "Тестовое сообщение"
                                );
                            }}
                        >
                            Тестовое сообщение
                        </Button>
                    </TableCell>
                </TableRow>
            );
        });
    };

    render = () => {
        if (this.state.renderedPlatform != this.props.platform) {
            this.props.tab.reload();
        }
        if (this.state.loaded) {
            return (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Чат</TableCell>
                                <TableCell>Отправка</TableCell>
                                <TableCell align="right">
                                    <Button onClick={this.props.tab.reload}>
                                        <RefreshIcon />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.getChatRows(this.state.chats)}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        } else {
            return <CircularProgress style={{ padding: 20 }} />;
        }
    };
}

class PostsTab extends React.Component{
    constructor(props) {
        super(props);
        this.state = { loaded: false, renderedPlatform: props.platform };
        this.loadChats();
    }

    render = () => {
        return <>{this.props.platform}</>
    }
}

export {MessagesTab, PostsTab};
