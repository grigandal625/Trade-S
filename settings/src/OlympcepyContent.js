/*global chrome*/

import React from "react";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import {MessagesTab, PostsTab} from "./OlympcepyTabs";

class OlympcepyContent extends React.Component {
    render = () => {
        switch (this.props.currentPage) {
            case 0:
                return <MessagesContent />;
            case 1:
                return <PostsContent />;
            case 2:
                return <FormatContent />;
            case 3:
                return <AccountContent />;
            default:
                return <Typography>Default page</Typography>;
        }
    };
}

function OPTabs(props) {
    const [value, setValue] = React.useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
        props.tabChanged(newValue);
    };
    return (
        <Paper>
            <Tabs value={value} onChange={handleChange}>
                <Tab label="Olymp Trade" />
                <Tab label="Pocket Option" />
            </Tabs>
        </Paper>
    );
}

class MessagesContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { index: 0 };
    }

    tabChanged = (index) => {
        this.setState((state) => {
            state.index = index;
            return state;
        });
    };

    render = () => {
        return (
            <>
                <OPTabs tabChanged={this.tabChanged} />
                <MessagesTab platform={this.state.index} />
            </>
        );
    };
}

class PostsContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { registered: false };
        var self = this;
        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
            if (request.accessToken && request.extension == "Olympcepy") {
                sendResponse({});
                self.loadGroups();
            }
        })
    }

    loadGroups = () => {
        chrome.storage.local.get(['settsData'], (res)=>{
            var r = res;
            if (r.settsData.posts && r.settsData.posts.accessToken){
                this.setState((state) => {
                    state.registered = true;
                    state.token = r.settsData.posts.accessToken;
                    return state;
                });
            } else {
                this.setState((state) => {
                    state.registered = false;
                    state.token = undefined;
                    return state;
                });
            }
        })
    }

    register = () => {
        chrome.storage.local.set({ "CepVkLogin": true }, () => {
            window.open(
                "https://oauth.vk.com/authorize?client_id=6290333&scope=wall,offline&redirect_uri=http://oauth.vk.com/blank.html&response_type=token&v=5.92"
            );
        });
    };

    tabChanged = (index) => {
        this.setState((state) => {
            state.index = index;
            return state;
        });
    };

    render = () => {
        if (!this.state.registered) {
            return (
                <>
                <Paper style={{padding: 10}}>
                    <Button variant="contained" color="primary" disableElevation onClick={this.register}>Привязать аккаунт вконтакте</Button>
                </Paper>
                </>
            );
        } else {
            return (
                <>
                <Paper style={{padding: 10}}>
                    <Button variant="contained" color="primary" disableElevation onClick={this.register}>Привязать другой аккаунт вконтакте</Button>
                </Paper>
                <OPTabs tabChanged={this.tabChanged} />
                <PostsTab platform={this.state.index} />
                </>
            );
        }
    };
}

class FormatContent extends React.Component {
    render = () => {
        return <>format</>;
    };
}

class AccountContent extends React.Component {
    render = () => {
        return <>account</>;
    };
}

export default OlympcepyContent;
