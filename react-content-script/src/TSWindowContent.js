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
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import Portal from "@material-ui/core/Portal";
import Popper from "@material-ui/core/Popper";

import SendIcon from "@material-ui/icons/Send";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { common } from "@material-ui/core/colors";
import { withStyles } from "@material-ui/core/styles";

import PlatformExplorer from "./PlatformExplorer";

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const WhiteTextField = withStyles({
    root: {
        background: "rgb(255, 255, 255, 0.2)",
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

class TSSignalButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    getSignalText = () => {
        var f = ButtonFormat.fromItems(this.props.button);
        var dirText = this.props.dir ? "вверх" : "вниз";
        var delta = this.props.delta;
        return f.restore(
            PlatformExplorer.ass,
            dirText,
            PlatformExplorer.exp(delta),
            PlatformExplorer.stn,
            PlatformExplorer.stv
        );
    };

    showToolTip = (e) => {
        var btnEl = e.currentTarget;
        this.setState((state) => {
            state.btnEl = btnEl;
            state.tooltip = true;
            state.tooltipText = this.getSignalText();
            if (state.timer === undefined) {
                console.log("tooltip");
                state.timer = setInterval(() => {
                    this.showToolTip({ currentTarget: btnEl });
                }, 500);
            }
            return state;
        });
    };

    hideToolTip = () => {
        this.setState((state) => {
            clearInterval(state.timer);
            state.timer = undefined;
            state.tooltip = false;
            return state;
        });
    };

    render = () => {
        var bg = this.props.dir ? "#008c3a" : "#d50000";
        return (
            <div>
                <Button
                    size="small"
                    variant="contained"
                    style={{
                        background: bg,
                        color: "#ffffff",
                    }}
                    onMouseOver={this.showToolTip}
                    onMouseOut={this.hideToolTip}
                    onClick={() => {
                        this.props.form.sendText(this.getSignalText());
                    }}
                >
                    Сигнал №{(this.props.index + 1).toString()}
                    {this.props.dir ? (
                        <ArrowUpwardIcon />
                    ) : (
                        <ArrowDownwardIcon />
                    )}
                </Button>
                <Popper
                    disablePortal={true}
                    style={{ border: 0, borderRadius: 3 }}
                    open={this.state.tooltip}
                    anchorEl={this.state.btnEl}
                    style={{
                        zIndex: 10001,
                        background: "#ffffff",
                        color: "#000000",
                        padding: 5,
                        borderRadius: 3,
                        marginTop: 3,
                        marginBottom: 3,
                        fontSize: 10,
                    }}
                    modifiers={{
                        flip: {
                            enabled: true,
                        },
                        preventOverflow: {
                            enabled: true,
                            boundariesElement: "window",
                        },
                    }}
                >
                    {this.state.tooltipText}
                </Popper>
            </div>
        );
    };
}

class TSWindowContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            gridDir: true,
            chats: true,
            groups: true,
            signalItems: {
                ass: PlatformExplorer.ass,
                exp: PlatformExplorer.exp(0),
                stn: PlatformExplorer.stn,
                stv: PlatformExplorer.stv,
            },
        };
        var self = this;
        chrome.storage.local.onChanged.addListener((r) => {
            if (r.buttons || r.timeDelta || r.userId) {
                self.build();
            }
        });

        this.build();
    }

    build = () => {
        var self = this;
        chrome.storage.local.get(["userId", "buttons", "timeDelta"], (r) => {
            if (!r.userId) {
                return;
            }
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
                state.signalItems = {
                    ass: PlatformExplorer.ass,
                    exp: PlatformExplorer.exp(state.delta),
                    stn: PlatformExplorer.stn,
                    stv: PlatformExplorer.stv,
                };
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

    getSignalItems = () => {
        this.setState((state) => {
            state.signalItems = {
                ass: PlatformExplorer.ass,
                exp: PlatformExplorer.exp(state.delta),
                stn: PlatformExplorer.stn,
                stv: PlatformExplorer.stv,
            };
            state.tooltip = ButtonFormat.fromItems(state.format).restore(
                PlatformExplorer.ass,
                state.dir,
                PlatformExplorer.exp(state.delta),
                PlatformExplorer.stn,
                PlatformExplorer.stv
            );
            return state;
        });
    };

    sendText = (text) => {
        var self = this;
        chrome.runtime.sendMessage(
            {
                extension: "TradeS",
                message: {
                    platform: PlatformExplorer.platform,
                    text: text,
                    chats: self.state.chats,
                    groups: self.state.groups,
                },
            },
            () => {
                self.setState((state) => {
                    state.informate = true;
                    state.information = text;
                    return state;
                });
            }
        );
    };

    closeInfo = (e, r) => {
        if (r === "clickaway") {
            return;
        }
        this.setState((state) => {
            state.informate = false;
            return state;
        });
    };

    getSiglalRows = () => {
        return this.state.buttons.map((button, index) => {
            var f = ButtonFormat.fromItems(button);
            return (
                <TableRow>
                    <TableCell style={{ borderBottom: 0 }}>
                        <TSSignalButton
                            button={button}
                            index={index}
                            dir={true}
                            delta={this.state.delta}
                            form={this}
                        />
                    </TableCell>
                    <TableCell style={{ borderBottom: 0 }} align="right">
                        <TSSignalButton
                            button={button}
                            index={index}
                            dir={false}
                            delta={this.state.delta}
                            form={this}
                        />
                    </TableCell>
                </TableRow>
            );
        });
    };

    signalsTable = () => {
        return (
            <TableContainer style={{ maxHeight: 134 }}>
                <Table size="small">{this.getSiglalRows()}</Table>
            </TableContainer>
        );
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
                    <TSAccordionDetails>
                        {this.signalsTable()}
                    </TSAccordionDetails>
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
                            id="trade-s-msg"
                            size="small"
                            style={{ width: "100%" }}
                            label="Текстовое сообщение"
                        ></WhiteTextField>
                        <Button
                            onClick={() => {
                                var v = document.getElementById("trade-s-msg")
                                    .value;
                                if (v.replaceAll(" ", "") != "") {
                                    this.sendText(v);
                                    document.getElementById(
                                        "trade-s-msg"
                                    ).value = "";
                                }
                            }}
                        >
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
                    <Portal container={PlatformExplorer.topElement}>
                        <Snackbar
                            open={this.state.informate}
                            autoHideDuration={6000}
                            onClose={this.closeInfo}
                        >
                            <Alert onClose={this.closeInfo} severity="info">
                                Отправлено: {this.state.information}
                            </Alert>
                        </Snackbar>
                    </Portal>
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
        return (
            <Typography style={{ padding: 10 }}>
                Перейдите в настройки расширения
            </Typography>
        );
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
