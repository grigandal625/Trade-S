/*global chrome*/

import React from "react";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import EmailIcon from "@material-ui/icons/Email";
import WallpaperIcon from "@material-ui/icons/Wallpaper";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import TradeSContent from "./TradeSContent";
import API from "./API";
import { Button } from "@material-ui/core";

chrome.storage.local.onChanged.addListener(()=>{
    API.uploadMySetts();
})

class CenterView extends React.Component {
    render() {
        return (
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                }}
            >
                {this.props.children}
            </div>
        );
    }
}

class DonatFrame extends React.Component {
    render = () => {
        return (
            <iframe
                src="https://money.yandex.ru/quickpay/shop-widget?writer=seller&targets=%D0%9F%D0%BE%D0%B4%D0%B4%D0%B5%D1%80%D0%B6%D0%BA%D0%B0%20%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0%20Trade-S&targets-hint=&default-sum=&button-text=13&payment-type-choice=on&mobile-payment-type-choice=on&hint=&successURL=&quickpay=shop&account=4100115567443945"
                width="423"
                height="222"
                frameborder="0"
                allowtransparency="true"
                scrolling="no"
            ></iframe>
        );
    };
}

class Page extends React.Component {
    constructor(props) {
        super(props);
        // this.state = { open: false, currentPage: 4 };

        this.state = { registered: false, logined: false };
        this.loadAccount();
        var self = this;

        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
                if (
                    request.userId &&
                    request.accessToken &&
                    request.extension == "TradeS"
                ) {
                    sendResponse({});
                    self.loadAccount();
                }
            }
        );
    }

    loadAccount = () => {
        var self = this;
        chrome.storage.local.get(["userId", "settsData"], (res) => {
            var r = res;
            if (r.settsData && r.settsData.accessToken && r.userId) {
                this.loadData(r.userId, r.settsData);
            } else {
                r.settsData = r.settsData ? r.settsData : {};
                chrome.storage.local.set({ settsData: r.settsData }, () => {
                    self.setState((state) => {
                        state.logined = false;
                        state.registered = false;
                        state.accessToken = undefined;
                        state.userId = undefined;
                        return state;
                    });
                });
            }
        });
    };

    loadData = (userId, setts) => {
        var s = setts;
        var self = this;
        self.setState(
            (state) => {
                state.logined = true;
            },
            () => {
                chrome.storage.local.set({TRSVkLogin: false}, ()=>{
                    API.uploadMySetts(() => {
                        self.setState((state) => {
                            state.registered = true;
                            state.accessToken = s.accessToken;
                            state.userId = userId;
                            return state;
                        });
                    });
                });
            }
        );
    };

    register = () => {
        chrome.storage.local.set({ "TRSVkLogin": true }, () => {
            window.open(
                "https://oauth.vk.com/authorize?client_id=6290333&scope=wall,offline&redirect_uri=http://oauth.vk.com/blank.html&response_type=token&v=5.92"
            );
        });
    };

    onPanelSwitch = (open) => (event) => {
        if (open === null) {
            open = !this.state.open;
        }
        if (
            event &&
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }
        this.setState((state) => {
            state.open = open;
            return state;
        });
    };

    home = () => {
        this.setState((state) => {
            state.currentPage = 4;
            return state;
        });
    };

    authContent = (logined) => {
        if (!logined) {
            return (
                <Card
                    style={{
                        width: 450,
                    }}
                >
                    <CardHeader
                        avatar={<Avatar src="icon_128.png" />}
                        title={<Typography variant="h5">Trade-S</Typography>}
                        subheader="Авторизация"
                    />
                    <CardContent
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography>
                            Для использования расширения необходимо пройти
                            авторизацию с помощью ВКонтакте.
                        </Typography>
                    </CardContent>
                    <CardActions
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={this.register}
                        >
                            Авторизироваться ВКонтакте
                        </Button>
                    </CardActions>
                </Card>
            );
        } else {
            return <CircularProgress />;
        }
    };

    render = () => {
        if (!this.state.registered) {
            return (
                <Backdrop open={true} style={{ color: "#e3e5fc" }}>
                    <CenterView>
                        {this.authContent(this.state.logined)}
                    </CenterView>
                </Backdrop>
            );
        }
        return (
            <>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={this.onPanelSwitch(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Avatar
                            src="icon_128.png"
                            style={{ cursor: "pointer" }}
                            onClick={this.home}
                        />
                        <Typography
                            style={{ cursor: "pointer", marginLeft: 10 }}
                            onClick={this.home}
                            variant="h6"
                        >
                            Trade-S
                        </Typography>
                    </Toolbar>
                </AppBar>
                <SwipeableDrawer
                    open={this.state.open}
                    onOpen={this.onPanelSwitch(true)}
                    onClose={this.onPanelSwitch(false)}
                >
                    <PageMenu page={this} />
                </SwipeableDrawer>
                <TradeSPath currentPage={this.state.currentPage} page={this} />
                <TradeSContent currentPage={this.state.currentPage} />
            </>
        );
    };
}

class TradeSPath extends React.Component {
    home = () => {
        this.props.page.setState((state) => {
            state.currentPage = 4;
            return state;
        });
    };

    render = () => {
        return (
            <Breadcrumbs style={{ padding: 20 }} aria-label="breadcrumb">
                <Link style={{ cursor: "pointer" }} onClick={this.home}>
                    Trade-S
                </Link>
                <Typography style={{ cursor: "default" }}>
                    {
                        [
                            "Сообщения в чатах группы",
                            "Пост на стене группы",
                            "Формат сигналов",
                            "Дополнительно",
                            "",
                        ][this.props.currentPage]
                    }
                </Typography>
            </Breadcrumbs>
        );
    };
}

class PageMenu extends React.Component {
    openMessages = () => {
        this.props.page.setState((state) => {
            state.open = false;
            state.currentPage = 0;
            return state;
        });
    };

    openPosts = () => {
        this.props.page.setState((state) => {
            state.open = false;
            state.currentPage = 1;
            return state;
        });
    };

    openFormat = () => {
        this.props.page.setState((state) => {
            state.open = false;
            state.currentPage = 2;
            return state;
        });
    };

    openAccount = () => {
        this.props.page.setState((state) => {
            state.open = false;
            state.currentPage = 3;
            return state;
        });
    };

    render = () => {
        return (
            <>
                <List style={{ marginTop: -8 }}>
                    <ListItem
                        style={{
                            padding: 16,
                            paddingLeft: 25,
                            background: "#3f51b5",
                            color: "white",
                        }}
                        button
                        key={"Меню настроек"}
                        onClick={this.props.page.onPanelSwitch(false)}
                    >
                        <ListItemIcon>
                            <ArrowBackIcon style={{ color: "white" }} />
                        </ListItemIcon>
                        <ListItemText
                            style={{ marginLeft: -20 }}
                            primary={"Меню настроек"}
                        />
                    </ListItem>
                </List>
                <Divider />
                <label style={{ textAlign: "center" }}>
                    Отправка сигналов в ВК
                </label>
                <Divider />
                <List>
                    <ListItem
                        button
                        onClick={this.openMessages}
                        key={"Сообщения в чатах группы"}
                    >
                        <ListItemIcon>
                            <EmailIcon />
                        </ListItemIcon>
                        <ListItemText primary={"Сообщения в чатах группы"} />
                    </ListItem>
                    <ListItem
                        button
                        onClick={this.openPosts}
                        key={"Пост на стене группы"}
                    >
                        <ListItemIcon>
                            <WallpaperIcon />
                        </ListItemIcon>
                        <ListItemText primary={"Пост на стене группы"} />
                    </ListItem>
                </List>

                <Divider />
                <label style={{ textAlign: "center" }}>Другие настройки</label>
                <Divider />
                <List>
                    <ListItem
                        button
                        onClick={this.openFormat}
                        key={"Формат сигналов"}
                    >
                        <ListItemIcon>
                            <RadioButtonCheckedIcon />
                        </ListItemIcon>
                        <ListItemText primary={"Формат сигналов"} />
                    </ListItem>
                    <ListItem
                        button
                        onClick={this.openAccount}
                        key={"Дополнительно"}
                    >
                        <ListItemIcon>
                            <AccountBoxIcon />
                        </ListItemIcon>
                        <ListItemText primary={"Дополнительно"} />
                    </ListItem>
                </List>
            </>
        );
    };
}

export default Page;
