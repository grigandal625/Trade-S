import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import Draggable from "react-draggable";
import Typography from "@material-ui/core/Typography";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";
import { withStyles } from "@material-ui/core/styles";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import OpenWithIcon from "@material-ui/icons/OpenWith";

import PlatformExplorer from "./PlatformExplorer";
import TSWindowContent from "./TSWindowContent";

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
            minHeight: 5,
        },
    },
    content: {
        "&$expanded": {
            margin: 2,
        },
    },
    expanded: {},
})(MuiAccordionSummary);

const TSAccordionDetails = withStyles((theme) => ({
    root: { padding: 0 },
}))(MuiAccordionDetails);

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
                        background: "#151726",
                        border: "#d7d3f0 1px solid",
                        borderRadius: 2,
                        zIndex: 10000,
                    }}
                >
                    <TSAccordion>
                        <TSAccordionSummary
                            expandIcon={
                                <ExpandMoreIcon style={{ color: "#ffffff" }} />
                            }
                        >
                            <header
                                onClick={(event) => event.stopPropagation()}
                                onFocus={(event) => event.stopPropagation()}
                                style={{ cursor: "move" }}
                            >
                                <Typography>
                                    <OpenWithIcon
                                        style={{
                                            color: "#ffffff",
                                            fontSize: 17,
                                            position: "relative",
                                            top: 3,
                                        }}
                                    />
                                    Trade-S
                                </Typography>
                            </header>
                        </TSAccordionSummary>
                        <TSAccordionDetails>
                            <TSWindowContent />
                        </TSAccordionDetails>
                    </TSAccordion>
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
            console.log("Error", e);
            setTimeout(() => {
                main();
            }, 2000);
        }
    } else {
        console.log("Asset element", !!PlatformExplorer.assetElement);
        console.log("Top element", !!PlatformExplorer.topElement);
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
