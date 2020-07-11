import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import Draggable from "react-draggable";
import Typography from "@material-ui/core/Typography";

import PlatformExplorer from "./PlatformExplorer";
import TSWindowContent from "./TSWindowContent";

class TradeSWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render = () => {
        return (
            <Draggable handle="header">
                <div
                    style={{
                        position: "fixed",
                        zIndex: 10000,
                        background: "#151726",
                        border: "#d7d3f0 1px solid",
                        borderRadius: 2,
                    }}
                >
                    <header style={{ cursor: "move", padding: 10 }}>
                        <Typography>Trade-S</Typography>
                    </header>
                    <div>
                        <TSWindowContent />
                    </div>
                </div>
            </Draggable>
        );
    };
}

var main = () => {
    console.log("main TS");
    if (PlatformExplorer.assetElement && PlatformExplorer.topElement) {
        var tsDiv = PlatformExplorer.topElement.appendChild(
            document.createElement("div")
        );
        tsDiv.setAttribute("id", "ts-div");
        try {
            ReactDOM.render(<TradeSWindow />, tsDiv);
        } catch (e) {
            if (e.message.indexOf("Cannot read property 'className'") + 1) {
                throw e;
            }
            setTimeout(() => {
                main();
            }, 2000);
        }
    } else {
        setTimeout(() => {
            main();
        }, 2000);
    }
};
console.log("main TS");
main();
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
