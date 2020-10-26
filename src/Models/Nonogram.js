import {InstructionSet} from "./InstructionSet";
import {Board} from "./Board";

export class Nonogram{
    constructor(data, layer) {
        this.data = data;
        this.width = data.width;
        this.height = data.height;

        this.instructions = new InstructionSet(this.data);

        this.board = new Board(layer, this,40,40);
    }
    ValidateStatus(grid){
        //validate grid against instructions,
        //somehow need to validate just the changed region
    }
}