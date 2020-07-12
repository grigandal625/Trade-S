import React, { Component } from "react";
import "./App.css";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

class App extends Component {
    render() {
        return (
            <Card style={{ width: 200 }}>
                <CardHeader
                    avatar={<Avatar src="icon_128.png" />}
                    title={<Typography variant="h5">Trade-S</Typography>}
                    subheader="Авто-сигналы"
                />
                <CardContent
                    style={{
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography>Добро пожаловать!.</Typography>
                </CardContent>
                <CardActions
                    style={{
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <a target="_blank" href="/settings/build/index.html">
                        <Button variant="contained" color="primary">
                            Настройки
                        </Button>
                    </a>
                </CardActions>
            </Card>
        );
    }
}

export default App;
