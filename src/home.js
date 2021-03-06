import css from "./styles/style.css"
import Konva from "konva"
import {Nonogram}  from "./Models/Nonogram";
import {NonogramSolver}  from "./Models/NonogramSolver";
import {DebugOverlay} from "./Models/DebugOverlay";

const nonogramJson = {
    "width": 5,
    "height": 5,
    "instructions": {
        "top": [
            [5],
            [1,1,1],
            [1,3],
            [1,1,1],
            [5]
        ],
        "left": [
            [5],
            [1,1],
            [5],
            [1,1,1],
            [5]
        ]
    }
};

const otherJson = {
    "width": 5,
    "height": 5,
    "instructions": {
        "top": [
            [1,3],
            [1,1],
            [1,1],
            [2],
            [3]
        ],
        "left": [
            [4],
            [1],
            [3,1],
            [1,1],
            [1,1]
        ]
    }
};

const averageJson = {
    "width": 10,
    "height": 10,
    "instructions": {
        "top": [
            [1,1],
            [5],
            [1,5],
            [5],
            [1,3,1],
            [1,3],
            [3,2],
            [1,2],
            [4,2],
            [6,3],
        ],
        "left": [
            [1,1,4],
            [1,1,2],
            [3,1,2],
            [3,2],
            [3,1],
            [5,1],
            [4],
            [3,1],
            [5],
            [6],
        ]
    }
};

// todo: divide in init & update methods
export default function init() {

    document.body.style.margin = "0";
    document.body.innerHTML = "<div id='container' style='height: 100vh;width: 100vw;'></div>";
    const container = document.querySelector("#container");

    // first we need to create a stage
    let stage = new Konva.Stage({
        container: 'container',   // id of container <div>
        width: container.offsetWidth,
        height: container.offsetHeight
    });

    // then create layer
    let layer = new Konva.Layer();

    const debugOverlay = new DebugOverlay();

    // create nonogram from json and graphic layer
    // Nonogram have init phase in constructor
    // maybe i need to create init method
    const nonogram = new Nonogram(averageJson, layer, debugOverlay);

    // add the layer to the stage
    stage.add(layer);

    // draw the image
    // maybe i need to keep layer management up here
    // but somehow need to pass event from board that it is updated and layer needs to be redrawn
    layer.draw();

    // draw cross after 1 sek
    const solver = new NonogramSolver(nonogram, debugOverlay);

    // solve
    solver.Solve();

    // todo: create game class that controls game flow - start, complete, restart, upload image, import from json, manual set
}
