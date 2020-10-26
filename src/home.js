import Konva from "konva"
import {Nonogram}  from "./Models/Nonogram";
import {NonogramSolver}  from "./Models/NonogramSolver";

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

    // create nonogram from json and graphic layer
    // Nonogram have init phase in constructor
    // maybe i need to create init method
    const nonogram = new Nonogram(otherJson, layer);

    // add the layer to the stage
    stage.add(layer);

    // draw the image
    // maybe i need to keep layer management up here
    // but somehow need to pass event from board that it is updated and layer needs to be redrawn
    layer.draw();

    // draw cross after 1 sek
    const solver = new NonogramSolver(nonogram);

    // solve
    solver.Solve();

    // todo: create game class that controls game flow - start, complete, restart, upload image, import from json, manual set
}
