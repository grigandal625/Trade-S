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
import Slider from "@material-ui/core/Slider";
import CircularProgress from "@material-ui/core/CircularProgress";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Link from "@material-ui/core/Link";

import AssessmentIcon from "@material-ui/icons/Assessment";
import UnfoldMoreIcon from "@material-ui/icons/UnfoldMore";
import TimelapseIcon from "@material-ui/icons/Timelapse";
import FormatLineSpacingIcon from "@material-ui/icons/FormatLineSpacing";
import DescriptionIcon from "@material-ui/icons/Description";
import SettingsIcon from "@material-ui/icons/Settings";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import MenuIcon from "@material-ui/icons/Menu";

import API from "./API";

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

class DonatFrame extends React.Component {
    render = () => {
        return (
            <>
                <iframe
                    src="https://money.yandex.ru/quickpay/shop-widget?writer=seller&targets=%D0%9F%D0%BE%D0%B4%D0%B4%D0%B5%D1%80%D0%B6%D0%BA%D0%B0%20%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0%20Trade-S&targets-hint=&default-sum=&button-text=13&payment-type-choice=on&mobile-payment-type-choice=on&hint=&successURL=&quickpay=shop&account=4100115567443945"
                    width="423"
                    height="222"
                    frameborder="0"
                    allowtransparency="true"
                    scrolling="no"
                ></iframe>
                <Typography>
                    Поделитесь{" "}
                    <Link
                        target="_blank"
                        href="https://yasobe.ru/na/trade_s_donat"
                    >
                        ссылкой
                    </Link>{" "}
                    для большей поддержки :)
                </Typography>
            </>
        );
    };
}

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
                return (
                    <>
                        <Paper style={{ padding: 40, margin: 40 }}>
                            <Typography>
                                Вас приветствует расширение-помощник для
                                автоматической отправки сигналов с платформ в
                                социальные сети и мессенджеры
                            </Typography>
                            <Typography>
                                Для настройки расширения нажмите меню
                                <Button>
                                    <MenuIcon />
                                </Button>
                            </Typography>
                        </Paper>
                        <Divider />
                        <div style={{ padding: 40 }}>
                            <DonatFrame />
                        </div>
                    </>
                );
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
        chrome.storage.local.get(["buttons", "timeDelta"], (r) => {
            var delta = r.timeDelta ? r.timeDelta : 0;
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
            try {
                cb(buttons, delta);
            } catch (e) {}
        });
    };

    updateButtons = (buttons, delta, callback) => {
        var cb = callback;
        if (delta != null) {
            chrome.storage.local.set(
                { buttons: buttons, timeDelta: delta },
                () => {
                    try {
                        cb(buttons, delta);
                    } catch (e) {}
                }
            );
        } else {
            chrome.storage.local.set({ buttons: buttons }, () => {
                try {
                    cb(buttons);
                } catch (e) {}
            });
        }
    };

    load = () => {
        this.getButtons((buttons, delta) => {
            this.setState((state) => {
                state.timeDelta = delta;
                state.buttons = buttons;
                state.loaded = true;
                return state;
            });
        });
    };

    addButton = () => {
        this.getButtons((buttons) => {
            buttons.push([]);
            this.updateButtons(buttons, undefined, (buttons) => {
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
            this.updateButtons(buttons, undefined, (buttons) => {
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
                    <Button>Предпросмотр</Button>
                </ListItem>
                <ListItem>
                    <TextField
                        variant="outlined"
                        style={{ width: "100%" }}
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
                            <ListItem
                                style={{ margin: 5, background: "#ffffff" }}
                            >
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

    setTimeDelta = (event, newValue) => {
        var v = newValue;
        this.updateButtons(this.state.buttons, v, () => {
            this.setState((state) => {
                state.timeDelta = v;
                return state;
            });
        });
    };

    valueLabelFormat = (value) => {
        return parseInt(value) >= 0 ? `+${value} ч.` : `${value} ч.`;
    };

    getMarks = () => {
        return [...Array(25).keys()].map((e, i) => {
            return {
                value: i - 12,
                label: i - 12 >= 0 ? `+${i - 12} ч.` : `${i - 12} ч.`,
            };
        });
    };

    render = () => {
        if (this.state.loaded) {
            return (
                <>
                    <Paper style={{ padding: 40, marginLeft: 5 }}>
                        <Typography>
                            Смещение времени в отсылаемом сигнале (для
                            экспирации к конкретному времени)
                        </Typography>
                        <Slider
                            value={this.state.timeDelta}
                            step={1}
                            marks={this.getMarks()}
                            min={-12}
                            max={12}
                            onChange={this.setTimeDelta}
                            style={{ paddingTop: 20, paddingBottom: 20 }}
                            aria-labelledby="discrete-slider"
                        />
                    </Paper>
                    {this.getButtonsList()}
                </>
            );
        }
        return <></>;
    };
}

class AccountContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
        };
    }

    load = () => {
        if (!this.state.loaded)
            API.getMyData((user) => {
                this.setState((state) => {
                    state.key = user.key;
                    state.loaded = true;
                    return state;
                });
            });
    };

    render = () => {
        this.load();
        if (this.state.loaded) {
            return (
                <>
                    <Card
                        style={{
                            margin: 40,
                            width: 423,
                        }}
                    >
                        <CardHeader
                            avatar={<Avatar src="icon_128.png" />}
                            title={
                                <Typography variant="h5">Trade-S</Typography>
                            }
                            subheader="Деавторизация"
                        />
                        <CardActions style={{ padding: 20 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    chrome.storage.local.clear(() => {
                                        window.location.reload();
                                    });
                                }}
                            >
                                Выйти
                            </Button>
                        </CardActions>
                    </Card>

                    <Divider />
                    <Paper style={{ margin: 40, padding: 40 }}>
                        <TextField
                            style={{ width: "100%" }}
                            label="Ключ для Trade-S Lite"
                            value={this.state.key}
                        ></TextField>
                    </Paper>
                    <Divider />
                    <div style={{ padding: 40 }}>
                        <DonatFrame />
                    </div>
                </>
            );
        }
        return <CircularProgress style={{ padding: 20 }} />;
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
