import Konva from "konva";

export const GridInstructionOrientations = {
    horizontal: 0,
    vertical: 1
}

export const GridInstructionLineDefaults = {
    sideLength: 20,
    strokeWidth: 1,
    stroke: "black"
}

export class GridInstructions{
    constructor(instructions, orientation = GridInstructionOrientations.horizontal, x=0,y=0) {
        this.orientation = orientation;
        this.x = x;
        this.y = y;
        this.instructions = instructions;
    }

    GetWidth(){
        if(this.orientation === GridInstructionOrientations.horizontal){
            // get length
            return this.instructions.length*GridInstructionLineDefaults.sideLength;
        } else {
            // get depth
            return this.GetDepth()*GridInstructionLineDefaults.sideLength;
        }
    }

    GetHeight(){
        if(this.orientation === GridInstructionOrientations.horizontal){
            // get depth
            return this.GetDepth()*GridInstructionLineDefaults.sideLength;
        } else {
            // get length
            return this.instructions.length*GridInstructionLineDefaults.sideLength;
        }
    }

    GetDepth(){
        return this.instructions.reduce((max, line) => {
            return Math.max( max, line.length );
        }, 0);
    }

    CreateInstances(){
        // calculating
        let rectParams = GridInstructionLineDefaults;
        // currently leaving sides the same size as grid tile size
        rectParams.width = GridInstructionLineDefaults.sideLength;
        rectParams.height = GridInstructionLineDefaults.sideLength;

        const depth = this.GetDepth();

        this.instructions.map((line, lineIndex) => {
            // iterate length

            if(this.orientation === GridInstructionOrientations.horizontal){
                rectParams.x = lineIndex*GridInstructionLineDefaults.sideLength + this.x;
            } else {
                rectParams.y = lineIndex*GridInstructionLineDefaults.sideLength + this.y;
            }

            const lineOffset = depth - line.length;

            return line.map((tile, tileIndex) => {
                //iterate depth
                if(this.orientation === GridInstructionOrientations.horizontal){
                    rectParams.y = ( lineOffset + tileIndex )*GridInstructionLineDefaults.sideLength + this.y;
                } else {
                    rectParams.x = ( lineOffset + tileIndex )*GridInstructionLineDefaults.sideLength + this.x;
                }
                // create instances
                tile.containerInst = new Konva.Rect(rectParams);
                tile.numberInst = new Konva.Text({
                    x: 4 + rectParams.x,
                    y: 2 + rectParams.y,
                    text: tile.number,
                    fontSize: 20
                });
                tile.crossInst = new Konva.Text({
                    x: 3 + rectParams.x,
                    y: 2 + rectParams.y,
                    text: 'X',
                    fontSize: 20,
                    visible: false
                });

                return tile;
            });
        })
    }

    UpdateInstructionsAt(index, instructions){
        if(index < this.instructions.length ){
            this.instructions[index] = instructions;
        }
    }

    AddToLayer(layer){
        this.instructions.map((line) => {
            line.map((tile) => {
                layer.add(tile.containerInst);
                layer.add(tile.numberInst);
                layer.add(tile.crossInst);
            });
        })
    }
}