/*global chrome*/

import React from "react";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Divider from "@material-ui/core/Divider";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import Popper from "@material-ui/core/Popper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";

import AssessmentIcon from "@material-ui/icons/Assessment";
import UnfoldMoreIcon from "@material-ui/icons/UnfoldMore";
import TimelapseIcon from "@material-ui/icons/Timelapse";
import FormatLineSpacingIcon from "@material-ui/icons/FormatLineSpacing";
import DescriptionIcon from "@material-ui/icons/Description";
import SettingsIcon from "@material-ui/icons/Settings";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";

import { MessagesTab, PostsTab } from "./TradeSTabs";
import {
    Breadcrumbs,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Button,
    ButtonGroup,
    ListItemIcon,
} from "@material-ui/core";

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

    currentTab = () => {
        return <MessagesTab platform={this.state.index} />;
    };

    render = () => {
        return (
            <>
                <OPTabs tabChanged={this.tabChanged} />
                {this.currentTab()}
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
    constructor(props) {
        super(props);
        this.state = { loaded: false, buttons: undefined };
        this.load();
    }

    getButtons = (callback) => {
        var self = this;
        var cb = callback;
        chrome.storage.local.get(["buttons"], (r) => {
            var buttons = r.buttons
                ? r.buttons
                : [
                      [
                          { type: "ass" },
                          { type: "text", text: "готовим" },
                      ],
                      [
                          { type: "ass" },
                          { type: "exp" },
                          { type: "dir" },
                          { type: "text", text: "СТАВИМ" },
                      ],
                  ];
            try {
                cb(buttons);
            } catch (e) {}
        });
    };

    updateButtons = (buttons, callback) => {
        var cb = callback;
        chrome.storage.local.set({ buttons: buttons }, () => {
            try {
                cb(buttons);
            } catch (e) {}
        });
    };

    load = () => {
        this.getButtons((buttons) => {
            this.setState((state) => {
                state.buttons = buttons;
                state.loaded = true;
                return state;
            });
        });
    };

    addButton = () => {
        this.getButtons((buttons) => {
            buttons.push([]);
            this.updateButtons(buttons, (buttons) => {
                this.setState((state) => {
                    state.buttons = buttons;
                    return state;
                });
            });
        });
    };

    deleteButton = (index) => {
        this.getButtons((buttons) => {
            buttons.splice(index, 1);
            this.updateButtons(buttons, (buttons) => {
                this.setState((state) => {
                    state.buttons = buttons;
                    return state;
                });
            });
        });
    };

    getFormatAvatar = (type) => {
        switch (type) {
            case "ass":
                return <AssessmentIcon />;
            case "dir":
                return <UnfoldMoreIcon />;
            case "exp":
                return <TimelapseIcon />;
            case "stn":
                return <FormatLineSpacingIcon />;
            case "stv":
                return <FormatLineSpacingIcon />;
            case "text":
                return <DescriptionIcon />;
        }
    };

    getFormatText = (format) => {
        switch (format.type) {
            case "ass":
                return "Пара";
            case "dir":
                return "Направление";
            case "exp":
                return "Экспирация";
            case "stn":
                return "Номер страйк-цены";
            case "stv":
                return "Значение страйк-цены";
            case "text":
                return "Текст";
        }
    };

    formatTypes = () => {
        return ["ass", "dir", "exp", "stn", "stv", "text"];
    };

    textFormatChanged = (formatIndex, buttonIndex) => (event) => {
        var v = event.currentTarget.value;
        var buttons = this.state.buttons;
        buttons[buttonIndex][formatIndex].text = v;
        this.setState(
            (state) => {
                state.buttons = buttons;
                return state;
            },
            () => {
                this.updateButtons(buttons);
            }
        );
    };

    getFormatContent = (format, formatIndex, buttonIndex) => {
        if (format.type == "text") {
            return (
                <TextField
                    value={format.text}
                    size="small"
                    onChange={this.textFormatChanged(formatIndex, buttonIndex)}
                ></TextField>
            );
        }
        return this.getFormatText(format);
    };

    closeMenus = () => {
        this.setState((state) => {
            state.buttonMenus = undefined;
            state.ref = undefined;
            return state;
        });
    };

    onAddItem = (type, button, index) => (event) => {
        button.push(type == "text" ? { type: type, text: "" } : { type: type });
        this.setState(
            (state) => {
                state.buttons[index] = button;
                state.buttonMenus = undefined;
                state.ref = undefined;
                return state;
            },
            () => {
                this.updateButtons(this.state.buttons);
            }
        );
    };

    onDeleteItem = (itemIndex, button, index) => (event) => {
        button.splice(itemIndex, 1);
        this.setState(
            (state) => {
                state.buttons[index] = button;
                state.buttonMenus = undefined;
                return state;
            },
            () => {
                this.updateButtons(this.state.buttons);
            }
        );
    };

    openAddItemMenu = (index) => (event) => {
        var t = event.currentTarget;
        this.setState((state) => {
            state.buttonMenus = {};
            state.buttonMenus[index] = { addItem: true };
            state.ref = t;
            return state;
        });
    };

    itemAdder = (button, index) => {
        var ref = React.createRef();
        return [
            <Button
                size="small"
                variant="outlined"
                onClick={this.openAddItemMenu(index)}
            >
                <AddIcon />
            </Button>,
            <Popper
                open={
                    this.state.buttonMenus &&
                    this.state.buttonMenus[index] &&
                    this.state.buttonMenus[index].addItem
                }
                anchorEl={this.state.ref ? this.state.ref : null}
                role={undefined}
                transition
            >
                <Paper>
                    <ClickAwayListener onClickAway={this.closeMenus}>
                        <MenuList
                            autoFocusItem={
                                this.state.buttonMenus &&
                                this.state.buttonMenus[index] &&
                                this.state.buttonMenus[index].addItem
                            }
                        >
                            {this.formatTypes().map((t) => {
                                return (
                                    <MenuItem
                                        onClick={this.onAddItem(
                                            t,
                                            button,
                                            index
                                        )}
                                    >
                                        {this.getFormatText({
                                            type: t,
                                        })}
                                    </MenuItem>
                                );
                            })}
                        </MenuList>
                    </ClickAwayListener>
                </Paper>
            </Popper>,
        ];
    };

    getButtonConstructor = (button, index) => {
        var preview = ButtonFormat.fromItems(this.state.buttons[index]).restore(
            "EUR USD",
            "вверх",
            "1 мин.",
            "0",
            "1.154"
        );
        return (
            <List>
                <ListItem>
                    <ButtonGroup variant="text">
                        <Button>{`Сигнал №${index + 1}`}</Button>
                        <Button
                            onClick={() => {
                                this.deleteButton(index);
                            }}
                        >
                            <DeleteIcon />
                        </Button>
                    </ButtonGroup>
                </ListItem>
                <ListItem>
                    <Breadcrumbs style={{ width: "100%" }} separator="">
                        {button.map((e, i) => {
                            return (
                                <ButtonGroup size="small" variant="outlined">
                                    <Button>
                                        {this.getFormatAvatar(e.type)}
                                        {this.getFormatContent(e, i, index)}
                                    </Button>
                                    <Button
                                        onClick={this.onDeleteItem(
                                            i,
                                            button,
                                            index
                                        )}
                                    >
                                        <DeleteIcon />
                                    </Button>
                                </ButtonGroup>
                            );
                        })}
                        {this.itemAdder(button, index)}
                    </Breadcrumbs>
                </ListItem>
                <ListItem>
                    <Typography>Предпросмотр</Typography>
                </ListItem>
                <ListItem>
                    <TextField
                        variant="outlined"
                        style={{ width: "100%", color: "black" }}
                        value={preview}
                    ></TextField>
                </ListItem>
            </List>
        );
    };

    getButtonsList = () => {
        return (
            <List>
                {this.state.buttons.map((e, i) => {
                    return (
                        <>
                            <Divider />
                            <ListItem>
                                {this.getButtonConstructor(e, i)}
                            </ListItem>
                            <Divider />
                        </>
                    );
                })}
                <Divider />
                <ListItem>
                    <Button
                        size="large"
                        style={{ width: "100%" }}
                        variant="outlined"
                        onClick={this.addButton}
                    >
                        <AddIcon />
                    </Button>
                </ListItem>
            </List>
        );
    };

    render = () => {
        if (this.state.loaded) {
            return <>{this.getButtonsList()}</>;
        }
        return <></>;
    };
}

class AccountContent extends React.Component {
    render = () => {
        return <>account</>;
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

export default TradeSContent;
