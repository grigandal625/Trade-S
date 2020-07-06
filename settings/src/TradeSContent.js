/*global chrome*/

import React from "react";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";

import {MessagesTab, PostsTab} from "./TradeSTabs";

class TradeSContent extends React.Component {
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
                <PostsTab platform={this.state.index} />
            </>
        );
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

export default TradeSContent;
