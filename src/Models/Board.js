import {GridInstructionOrientations, GridInstructions} from "./GridInstructions";
import {Grid} from "./Grid";

export const boardUpdated = new Event('board.updated');

export class Board{
    constructor(layer, nonogram, x=0, y=0) {
        this.layer = layer;
        this.nonogram = nonogram;

        this.leftInstructions = new GridInstructions(this.nonogram.instructions.left, GridInstructionOrientations.vertical,x,y);
        this.topInstructions = new GridInstructions(this.nonogram.instructions.top, GridInstructionOrientations.horizontal,x,y);

        this.grid = new Grid(this.nonogram.height, this.nonogram.width,x,y);

        // set coordinate
        this.leftInstructions.y += this.topInstructions.GetHeight();
        this.topInstructions.x += this.leftInstructions.GetWidth();

        this.grid.x += this.leftInstructions.GetWidth();
        this.grid.y += this.topInstructions.GetHeight();

        this.grid.AddToLayer(this.layer);
        this.leftInstructions.CreateInstances();
        this.leftInstructions.AddToLayer(this.layer);
        this.topInstructions.CreateInstances();
        this.topInstructions.AddToLayer(this.layer);
    }

    SetTiles(grid, startX= 0, startY= 0){
        this.grid.SetTiles(grid, startX, startY);
        this.layer.draw();
    }

    GetTiles(startX, startY, endX, endY){
        return this.grid.GetTiles(startX, startY, endX, endY);
    }

    UpdateInstructions(orientation, index, instructions){

        if(orientation === GridInstructionOrientations.horizontal){
            this.leftInstructions.UpdateInstructionsAt(index,instructions)
        } else {
            this.topInstructions.UpdateInstructionsAt(index,instructions)
        }

        this.layer.draw();
    }
}