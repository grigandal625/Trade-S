/*global chrome*/
import React from "react";

import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Switch from "@material-ui/core/Switch";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";

import SendIcon from "@material-ui/icons/Send";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { common } from "@material-ui/core/colors";
import { withStyles } from "@material-ui/core/styles";

import PlatformExplorer from "./PlatformExplorer";
import Accordion from "@material-ui/core/Accordion";

const WhiteTextField = withStyles({
    root: {
        "& .Mui-focused": {
            color: "#ffffff",
        },
        "& input": {
            color: "#ffffff",
        },
        "& label": {
            color: "#dbdbdb",
        },
        "&:hover label": {
            color: "#ffffff",
        },
        "& .MuiInput-underline:after": {
            borderColor: "#ffffff",
        },
        "&:hover .MuiInput-underline:before": {
            borderBottomColor: "#ffffff",
        },
        "& .MuiInput-underline:before": {
            borderBottomColor: "#dbdbdb",
        },
    },
})(TextField);

const TSAccordion = withStyles({
    root: {
        border: "1px solid rgba(0, 0, 0, .125)",
        boxShadow: "none",
        background: "#151726",
        color: "#ffffff",
        "&:not(:last-child)": {
            borderBottom: 0,
        },
        "&:before": {
            display: "none",
        },
        "&$expanded": {
            border: "1px solid silver",
            margin: "auto",
        },
    },
    expanded: {},
})(MuiAccordion);

const TSAccordionSummary = withStyles({
    root: {
        margin: -4,
        minHeight: 5,
        "&$expanded": {
            marginTop: 0,
            marginBottom: 0,
            minHeight: "12px",
            height: "12px",
        },
    },
    content: {
        "&$expanded": { fontSize: 12, marginTop: 0, marginBottom: 0 },
    },
    expanded: { height: 12 },
})(MuiAccordionSummary);

const TSAccordionDetails = withStyles((theme) => ({
    root: {},
}))(MuiAccordionDetails);

class TSWindowContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            gridDir: true,
            chats: true,
            groups: true,
        };
        var self = this;
        chrome.storage.local.onChanged.addListener((r) => {
            if (r.buttons || r.timeDelta) {
                self.build();
            }
        });

        this.build();
    }

    build = () => {
        var self = this;
        chrome.storage.local.get(["buttons", "timeDelta"], (r) => {
            var buttons = r.buttons
                ? r.buttons
                : [
                      [{ type: "ass" }, { type: "text", text: "готовим" }],
                      [
                          { type: "ass" },
                          { type: "exp" },
                          { type: "dir" },
                          { type: "text", text: "СТАВИМ" },
                      ],
                  ];
            var delta = r.timeDelta ? r.timeDelta : 0;
            self.setState((state) => {
                state.buttons = buttons;
                state.delta = delta;
                state.loaded = true;
                return state;
            });
        });
    };

    switchChats = (e) => {
        var c = !this.state.chats;
        this.setState((state) => {
            state.chats = c;
            return state;
        });
    };

    switchGroups = (e) => {
        var c = !this.state.groups;
        this.setState((state) => {
            state.groups = c;
            return state;
        });
    };

    getAccordion = () => {
        return (
            <div>
                <TSAccordion>
                    <TSAccordionSummary
                        expandIcon={
                            <ExpandMoreIcon style={{ color: "#ffffff" }} />
                        }
                    >
                        Сигналы
                    </TSAccordionSummary>
                    <TSAccordionDetails>Signals</TSAccordionDetails>
                </TSAccordion>
                <TSAccordion>
                    <TSAccordionSummary
                        expandIcon={
                            <ExpandMoreIcon style={{ color: "#ffffff" }} />
                        }
                    >
                        Дополнительно
                    </TSAccordionSummary>
                    <TSAccordionDetails>
                        <WhiteTextField
                            size="small"
                            style={{ width: "100%" }}
                            label="Текстовое сообщение"
                        ></WhiteTextField>
                        <Button>
                            <SendIcon
                                size="small"
                                style={{ color: common.white }}
                            />
                        </Button>
                    </TSAccordionDetails>
                </TSAccordion>
            </div>
        );
    };
    //#008c3a - green #d50000 - red

    render = () => {
        if (this.state.loaded) {
            return (
                <div>
                    <List style={{ padding: 0 }}>
                        <ListItem style={{ paddingTop: 4, paddingBottom: 4 }}>
                            <Typography>Отправка:</Typography>
                            <Switch
                                color="primary"
                                checked={this.state.chats}
                                onClick={this.switchChats}
                            />
                            <Typography>Чаты</Typography>
                            <Switch
                                color="primary"
                                checked={this.state.groups}
                                onClick={this.switchGroups}
                            />
                            <Typography>Группы</Typography>
                        </ListItem>
                    </List>
                    {this.getAccordion()}
                </div>
            );
        }
        return <Typography>Loading...</Typography>;
    };
}

class ButtonFormat {
    constructor() {
        this.items = [
            { type: "ass" },
            { type: "exp" },
            { type: "dir" },
            { type: "text", text: "СТАВИМ!!!" },
        ];
    }

    restore = (ass, dir, exp, stn, stv) => {
        return this.items
            .map((e) => {
                switch (e.type) {
                    case "ass":
                        return ass;
                    case "dir":
                        return dir;
                    case "exp":
                        return exp;
                    case "stn":
                        return stn;
                    case "stv":
                        return stv;
                    case "text":
                        return e.text;
                }
            })
            .join(" ");
    };

    add = (type, text) => {
        this.items.push(
            type == text ? { type: type, text: text } : { type: type }
        );
    };

    insert = (index, type, text) => {
        this.items[index] =
            type == text ? { type: type, text: text } : { type: type };
    };

    delete = (index) => {
        this.items.splice(index);
    };

    update = (index, type, text) => {
        this.items[index] =
            type == text ? { type: type, text: text } : { type: type };
    };

    static fromItems = (items) => {
        var b = new ButtonFormat();
        b.items = items;
        return b;
    };
}

export default TSWindowContent;
