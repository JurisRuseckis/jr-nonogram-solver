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
        this.taggedLines = []
        this.CalculateLineValues();

        // currently will hold whole snapshot as taggedLines, but will need to move to something like git
        // first we push initial state
        this.history = [this.taggedLines];
    }

    CalculateLineValues(affectedLines = null){
        // if null then it is first time
        let lines = affectedLines == null
            ? this.TagLines()
            : affectedLines;


        // todo: make method for line calculation
        // todo: divide in oneTime and repeatable calculatables
        lines = lines.map((line) => {

            // grid tiles
            line.empty = 0;
            line.filled = 0;
            line.crossed = 0;

            let tiles = this.GetLineTiles(line);
            line.total = tiles.length;
            tiles.map((tile) => {
                if(tile.type === tileType.cross){
                    line.crossed ++;
                } else if (tile.type === tileType.filled){
                    line.filled ++;
                } else {
                    line.empty ++;
                }
            });

            // instruction tiles
            line.minLineSum = 0
            line.largestInstruction = line.instructions.reduce((max, instruction) => {
                line.minLineSum += instruction.number;
                return Math.max( max, instruction.number );
            }, 0)

            line.fillSum = line.minLineSum;
            line.minLineSum += line.instructions.length - 1;


            // todo: make method that calculates value
            line.value = 0;
            if(line.empty !== 0){
                line.value += line.minLineSum / line.total;
                line.value += line.filled / line.fillSum;
            }


            return line;
        })

        //this will calculate which line will be next
        lines = lines.sort((a,b) => {
            return b.value - a.value;
        });

        this.taggedLines = lines;

        this.PrintDebug();
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

    PrintDebug(){
        this.debugOverlay.buildTable(this.taggedLines.map((line) => {
            return {
                id: line.id,
                fillSum: line.fillSum,
                minLineSum: line.minLineSum,
                largestInstruction: line.largestInstruction,
                empty: line.empty,
                filled: line.filled,
                crossed: line.crossed,
                value: line.value
            };
        }));
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
        this.CalculateLineValues();

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
        // setTimeout(()=>{
        //     this.MakeMove();
        // }, 1000);

        this.DoSimpleBoxesTechnique();

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

    DoSimpleBoxesTechnique(){
        this.taggedLines.map((line, lineindex) => {
            console.group(line.id);
            let lineScribble = this.ScribbleIndices(lineindex);
            let diff = line.total - lineScribble.length;
            if(diff>0){
                // populate variations
                let leftover = Array.from({length: diff}, () =>(-1));
                let leftVariation = lineScribble.slice().concat(leftover);
                let rightVariation = lineScribble.slice();
                leftover.map((dif) => {
                    rightVariation.unshift(dif);
                })

                console.log(leftVariation);
                console.log(rightVariation);
                //find intersections
                let overlap = leftVariation.map((leftTile, leftIndex) => {
                    if(leftTile === rightVariation[leftIndex]){
                        return leftTile
                    }
                    return -1;
                })
                console.log(overlap)

                // link intersections with instructions
            } else {
                console.log(`${line.id} is a full line`);
            }
            console.groupEnd();
        })
    }

    ScribbleIndices(lineIndex){
        let coordinatePointer = 0;
        let fill = [];

        this.taggedLines[lineIndex].instructions.map((instruction,instructionIndex)=>{

            fill = fill.concat(Array.from({length: instruction.number}, () =>(instructionIndex)))

            coordinatePointer += instruction.number;

            if(instructionIndex < this.taggedLines[lineIndex].instructions.length - 1 ){
                fill.push(-1);
                coordinatePointer++;
            }

        })

        return fill;
    }
}