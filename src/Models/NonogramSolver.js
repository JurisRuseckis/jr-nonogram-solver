import {tileType} from "./Grid";
import {GridInstructionOrientations} from "./GridInstructions";
import {DebugOverlay} from "./DebugOverlay";

export class NonogramSolver{
    constructor(nonogram, debugOverlay) {
        this.nonogram = nonogram;
        this.debugOverlay = debugOverlay;
        // todo: will need to move some functionalities to nonogram components to ease solver
        // todo: will need to remake into partial lines to divide nonogram in smaller sectors
        // todo: make seperate class for lines to execute lineSpecific operations
        this.taggedLines = this.CalculateLineValues();

        // currently will hold whole snapshot as taggedLines, but will need to move to something like git
        // first we push initial state
        this.history = [this.taggedLines];
    }

    CalculateLineValues(affectedLines = null){
        // if null then it is first time
        let lines = affectedLines == null
            ? this.TagLines()
            : affectedLines;

        lines = lines.map((line) => {

            // grid tiles
            let tileCounts = {
                empty: 0,
                filled: 0,
                crossed: 0,
            }

            let tiles = this.GetLineTiles(line);

            tiles.map((tile) => {
                if(tile.type === tileType.cross){
                    tileCounts.crossed ++;
                } else if (tile.type === tileType.filled){
                    tileCounts.filled ++;
                } else {
                    tileCounts.empty ++;
                }
            });

            // instruction tiles
            line.minLineSum =  line.instructions.reduce((sum, instruction) => {
                return sum + instruction.number;
            }, 0) + (line.instructions.length - 1);

            line.minLineSum = 0
            line.largestInstruction = line.instructions.reduce((max, instruction) => {
                line.minLineSum += instruction.number();
                return Math.max( max, instruction.number );
            }, 0)
            line.minLineSum += line.instructions.length - 1;

            return line;
        })

        //this will calculate which line will be next
        lines = lines.sort((a,b) => {
            return b.minLineSum - a.minLineSum;
        });

        // this.PrintToDebug();

        return lines;
    }

    TagLines(){
        let taggedLines = this.nonogram.instructions.left.map((line,lineIndex)=>{
            return {
                // original index to find in instructionSet
                originalIndex: lineIndex,
                id: `H${lineIndex}`,
                instructions: line,
                checked: false,
                orientation: GridInstructionOrientations.horizontal
            }
        });

        taggedLines = taggedLines.concat(this.nonogram.instructions.top.map((line,lineIndex)=>{
            return {
                // original index to find in instructionSet
                originalIndex: lineIndex,
                id: `V${lineIndex}`,
                instructions: line,
                checked: false,
                orientation: GridInstructionOrientations.vertical
            }
        }));

        return taggedLines;
    }

    // todo: create method to setLineTiles
    GetLineTiles(line){
        if(line.orientation === GridInstructionOrientations.horizontal){
            return this.nonogram.board.GetTiles(0,line.originalIndex,this.nonogram.height - 1,line.originalIndex)
        } else {
            // probably will need to reduce to single array to work properly
            return this.nonogram.board.GetTiles(line.originalIndex,0,line.originalIndex,this.nonogram.width - 1).map((tile) =>{
                return tile[0];
            });
        }
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
                        : this.taggedLines[lineIndex].originalIndex;

                    // row
                    let y = instruction.orientation === GridInstructionOrientations.horizontal
                        ? this.taggedLines[lineIndex].originalIndex
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
            coordY = this.taggedLines[lineIndex].originalIndex;
            fill = [fill];
        } else {
            coordX = this.taggedLines[lineIndex].originalIndex;
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
            return instruction;
        })

        this.nonogram.board.UpdateInstructions(
            this.taggedLines[lineIndex].orientation,
            this.taggedLines[lineIndex].originalIndex,
            this.taggedLines[lineIndex].instructions);
    }

    LinkAffectedLine(lineIndex){
        //get line indices
        let line = this.taggedLines[lineIndex];
        //get tiles
        let tiles;
        if(line.orientation === GridInstructionOrientations.horizontal){
            tiles = this.nonogram.board.GetTiles(0,line.originalIndex,this.nonogram.height - 1,line.originalIndex)
        } else {
            // probably will need to reduce to single array to work properly
            tiles = this.nonogram.board.GetTiles(line.originalIndex,0,line.originalIndex,this.nonogram.width - 1);
        }
        // todo: finish this method
        // check tiles & link
        // starting with side tiles
        // console.log(tiles);
        // add & link crosses
    }

    ResolveAffectedLines(affectedTiles){
        let affectedLineIndices = [];

        affectedTiles.fill.map((fillLine, fillLineIndex) => {
            //horizontal
            // find respective line Index
            let lineIndex = this.taggedLines.findIndex((taggedLines) => taggedLines.orientation === GridInstructionOrientations.horizontal
                && taggedLines.originalIndex === fillLineIndex+affectedTiles.coordY);

            if(lineIndex !== -1){
                affectedLineIndices.push(lineIndex)
            }

            // vertical lines will duplicate
            fillLine.map((tile, tileIndex) => {
                let lineIndex = this.taggedLines.findIndex((taggedLines) => taggedLines.orientation === GridInstructionOrientations.vertical
                    && taggedLines.originalIndex === tileIndex+affectedTiles.coordX);

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
            // link affected lines without the one filled
            if(lineIndex !== changedLineIndex){
                this.LinkAffectedLine(lineIndex);
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