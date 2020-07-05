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
import Avatar from '@material-ui/core/Avatar';

import OlympcepyContent from "./OlympcepyContent";

class Page extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: false, currentPage: 4 };
    }

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
    }

    render = () => {
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
                        <Avatar src="icon_128.png" style={{cursor: 'pointer'}} onClick={this.home}/>
                        <Typography style={{cursor: 'pointer', marginLeft: 10}} onClick={this.home} variant="h6">Olympcepy</Typography>
                    </Toolbar>
                </AppBar>
                <SwipeableDrawer
                    open={this.state.open}
                    onOpen={this.onPanelSwitch(true)}
                    onClose={this.onPanelSwitch(false)}
                >
                    <PageMenu page={this} />
                </SwipeableDrawer>
                <OlympcepyPath
                    currentPage={this.state.currentPage}
                    page={this}
                />
                <OlympcepyContent currentPage={this.state.currentPage} />
            </>
        );
    };
}

class OlympcepyPath extends React.Component {

    home = () => {
        this.props.page.setState((state) => {
            state.currentPage = 4;
            return state;
        });
    }

    render = () => {
        return (
            <Breadcrumbs style={{padding: 20}} aria-label="breadcrumb">
                <Link style={{cursor: 'pointer'}} onClick={this.home}>Olympcepy</Link>
                <Typography style={{cursor: 'default'}}>
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
