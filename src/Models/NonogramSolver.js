import {tileType} from "./Grid";
import {GridInstructionOrientations} from "./GridInstructions";

export class NonogramSolver{
    constructor(nonogram) {
        this.nonogram = nonogram;
        this.moves = [];
        // will need to move some functionalities to nonogram components to ease solver
        this.taggedLines = this.TagLines();
    }

    CalculateLineValues(){
        //this will calculate which line will be next
    }

    TagLines(){
        let taggedLines = this.nonogram.instructions.left.map((line,lineIndex)=>{
            return {
                // original index to find in instructionSet
                index: lineIndex,
                minLineSum:  line.reduce((sum, instruction) => {
                    return sum + instruction.number;
                }, 0) + (line.length - 1),
                instructions: line,
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
                instructions: line,
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
        // todo: figure out way to calculate lineValues to pick line to fill
        let lineIndex = this.taggedLines.findIndex((line) => !line.checked);
        if(lineIndex === -1){
            return false;
        }
        // fill line
        let affectedTiles = this.FillLine(lineIndex);
        let affectedLineIndices = this.ResolveAffectedLines(affectedTiles);
        // cross out instructions if needed
        this.HandleAffectedLines(affectedLineIndices, lineIndex);
        // add crosses where needed
        // cross out instructions cleared with crosses probably will need recursion here


        // validate move
        // register move
        // if continue, return true
        this.taggedLines[lineIndex].checked = true;
        return true;
    }

    FillLine(lineIndex){
        let fill = [];

        if(this.taggedLines[lineIndex].minLineSum === this.nonogram.width) {
            // if instructions can fill the whole line
            let coordinatePointer = 0;

            this.taggedLines[lineIndex].instructions = this.taggedLines[lineIndex].instructions.map((instruction,instructionIndex)=>{

                fill = fill.concat(Array.from({length: instruction.number}, () =>(tileType.filled)))
                for(let i = coordinatePointer; i < coordinatePointer + instruction.number; i++){
                    //column
                    let x = instruction.orientation === GridInstructionOrientations.horizontal
                        ? i
                        : this.taggedLines[lineIndex].index;

                    // row
                    let y = instruction.orientation === GridInstructionOrientations.horizontal
                        ? this.taggedLines[lineIndex].index
                        : i;

                    instruction.linkedTiles.push([x,y])
                }
                coordinatePointer += instruction.number;

                if(instructionIndex < this.taggedLines[lineIndex].instructions.length - 1 ){
                    fill.push(tileType.cross)
                    coordinatePointer++;
                }

                return instruction;
            })

        }

        //handle orientation
        let coordX = 0;
        let coordY = 0;
        if(this.taggedLines[lineIndex].orientation === GridInstructionOrientations.horizontal){
            coordY = this.taggedLines[lineIndex].index;
            fill = [fill];
        } else {
            coordX = this.taggedLines[lineIndex].index;
            fill = fill.map(tile => [tile]);
        }

        this.nonogram.board.SetTiles(fill, coordX, coordY);
        this.taggedLines.checked = true;
        return {
            fill: fill,
            coordX: coordX,
            coordY: coordY,
        }
    }

    CheckInstructions(lineIndex){
        // this.taggedLines[lineIndex];
        this.taggedLines[lineIndex].instructions = this.taggedLines[lineIndex].instructions.map((instruction) => {
            if(instruction.linkedTiles.length === instruction.number){
                instruction.cross = true;
                instruction.crossInst.show();
            }
        })

        this.nonogram.board.UpdateInstructions(
            this.taggedLines[lineIndex].orientation,
            this.taggedLines[lineIndex].index,
            this.taggedLines[lineIndex].instructions);
    }

    LinkAffectedLines(lineIndex){
        //get line indices
        let line = this.taggedLines[lineIndex];
        //get tiles
        let tiles;
        if(line.orientation === GridInstructionOrientations.horizontal){
            tiles = this.nonogram.board.GetTiles(0,line.index,this.nonogram.vertical - 1,line.index)
        } else {
            // probably will need to reduce to single array to work properly
            tiles = this.nonogram.board.GetTiles(line.index,0,line.index,this.nonogram.width - 1);
        }


        //check tiles & link
        //add & link crosses
    }

    ResolveAffectedLines(affectedTiles){
        let affectedLineIndices = [];

        affectedTiles.fill.map((fillLine, fillLineIndex) => {
            //horizontal
            // find respective line Index
            let lineIndex = this.taggedLines.findIndex((taggedLines) => taggedLines.orientation === GridInstructionOrientations.horizontal
                && taggedLines.index === fillLineIndex+affectedTiles.coordY);

            if(lineIndex !== -1){
                affectedLineIndices.push(lineIndex)
            }

            // vertical lines will duplicate
            fillLine.map((tile, tileIndex) => {
                let lineIndex = this.taggedLines.findIndex((taggedLines) => taggedLines.orientation === GridInstructionOrientations.vertical
                    && taggedLines.index === tileIndex+affectedTiles.coordX);

                if(lineIndex !== -1){
                    affectedLineIndices.push(lineIndex)
                }
            })
        })

        affectedLineIndices = affectedLineIndices.filter((value,index,self) =>{
            return self.indexOf(value) === index;
        })

        // todo: decide if i want indices or objects themselves
        return affectedLineIndices;
    }

    HandleAffectedLines(affectedLineIndices, changedLineIndex){
        affectedLineIndices.map((lineIndex) => {
            // link affected lines
            if(lineIndex !== changedLineIndex){
                this.LinkAffectedLines(lineIndex);
            }

            this.CheckInstructions(lineIndex);
        });
    }

    Solve(){
        // need to add condition somehow
        this.MakeMove();

        // console.log(this.nonogram.board.GetTiles(1,1,4,3));
        // horizontal line
        // console.log(this.nonogram.board.GetTiles(0,1,4,1));
        // vertical line
        // console.log(this.nonogram.board.GetTiles(1,0,1,4));
        // setInterval(()=>{
        //     this.MakeMove();
        // }, 500);
        // while (this.MakeMove()){
        //
        // }
    }
}