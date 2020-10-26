import {tileType} from "./Grid";
import {GridInstructionOrientations} from "./GridInstructions";

export class NonogramSolver{
    constructor(nonogram) {
        this.nonogram = nonogram;
        this.moves = [];
        // will need to move some functionalities to nonogram components to ease solver
        this.tagedLines = this.TagLines();
        console.log(this.tagedLines);
    }

    TagLines(){
        let taggedLines = this.nonogram.instructions.left.map((line,lineIndex)=>{
            return {
                // original index to find in instructionSet
                index: lineIndex,
                minLineSum:  line.reduce((sum, instruction) => {
                    return sum + instruction.number;
                }, 0) + (line.length - 1),
                line: line,
                checked: false,
                orientation: GridInstructionOrientations.horizontal
            }
        });

        taggedLines = taggedLines.concat(this.nonogram.instructions.top.map((line,lineIndex)=>{
            return {
                // original index to find in instructionSet
                index: lineIndex,
                minLineSum:  line.reduce((sum, instruction) => {
                    return sum + instruction.number;
                }, 0) + (line.length - 1),
                line: line,
                checked: false,
                orientation: GridInstructionOrientations.vertical
            }
        }));

        taggedLines = taggedLines.sort((a,b) => {
            return b.minLineSum - a.minLineSum;
        });

        return taggedLines;
    }

    MakeMove(){
        // find if there is something to fill
        let lineIndex = this.tagedLines.findIndex((line) => !line.checked);
        if(lineIndex === -1){
            return false;
        }
        // fill line
        this.fillLine(this.tagedLines[lineIndex])

        // add crosses where needed
        // cross out instructions if needed

        // validate move
        // register move
        // if continue, return true
        this.tagedLines[lineIndex].checked = true;
        return true;
    }

    fillLine(taggedLine){
        let fill = [];

        if(taggedLine.minLineSum === this.nonogram.width) {
            // if instructions can fill the whole line
            let coordinatePointer = 0;

            taggedLine.line.map((instruction,instructionIndex)=>{

                fill = fill.concat(Array.from({length: instruction.number}, () =>(tileType.filled)))
                coordinatePointer += instruction.number;

                if(instructionIndex < taggedLine.line.length - 1 ){
                    fill.push(tileType.cross)
                    coordinatePointer++;
                }

                return instruction;
            })

        }

        //handle orientation
        let coordX = 0;
        let coordY = 0;
        if(taggedLine.orientation === GridInstructionOrientations.horizontal){
            coordY = taggedLine.index;
            fill = [fill];
        } else {
            coordX = taggedLine.index;
            fill = fill.map(tile => [tile]);
        }

        this.nonogram.board.SetTiles(fill, coordX, coordY);
    }

    Solve(){
        // need to add condition somehow
        setInterval(()=>{
            this.MakeMove();
        }, 500);
        // while (this.MakeMove()){
        //
        // }
    }
}