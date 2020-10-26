import Konva from "konva"

export const tileType = {
    empty: 0,
    filled: 1,
    cross: 2
}

export const tileDefaults = {
    width: 20,
    height: 20,
    strokeWidth: 1,
    stroke: "black"
}

export const tileRectParams = {
    0 : {
        width: tileDefaults.width,
        height: tileDefaults.height,
        fill: 'white',
        stroke: tileDefaults.stroke,
        strokeWidth: tileDefaults.strokeWidth,
    },
    1 : {
        width: tileDefaults.width,
        height: tileDefaults.height,
        fill: 'black',
        stroke: tileDefaults.stroke,
        strokeWidth: tileDefaults.strokeWidth,
    },
    // same as first cross comes after
    2 : {
        width: tileDefaults.width,
        height: tileDefaults.height,
        fill: 'white',
        stroke: tileDefaults.stroke,
        strokeWidth: tileDefaults.strokeWidth,
    },
}

export const fillDefaults = {
    0: 'white',
    1: 'black'
}

export class Grid{
    constructor(rowCount, columnCount, x = 20, y = 20) {
        this.rowCount = rowCount;
        this.columnCount = columnCount;
        this.grid = Array.from({length: this.rowCount}, () =>
            Array.from({length: this.columnCount}, () =>
                ({
                    type:tileType.empty
                })));
        // for canvas starting point
        this.x = x;
        this.y = y;
    }

    SetTile(row, column, type){
        if(this.grid.length > row && this.grid[row].length > column){
            this.grid[row][column].type = type;
        } else {
            throw new Error(`Undefined Offset ${row},${column}`);
        }
    }
    SetTiles(grid, startX= 0, startY= 0){
        grid.map((row, rowIndex) => {
            row.map((col, colIndex) => {
                if(this.grid.length > rowIndex+startY
                && this.grid[rowIndex+startY].length > colIndex+startX){
                    // change type and filling of tile
                    this.grid[rowIndex+startY][colIndex+startX].type = col;
                    this.grid[rowIndex+startY][colIndex+startX].tile.fill(fillDefaults[col%2]);
                    if(col === tileType.cross){
                        this.grid[rowIndex+startY][colIndex+startX].x.show();
                    } else {
                        this.grid[rowIndex+startY][colIndex+startX].x.hide();
                    }
                } else {
                    throw new Error(`Grid Undefined Offset: ${rowIndex+startY},${colIndex+startX}`)
                }

            });
        });
    }
    AddToLayer(layer){
        this.grid.map((row, rowIndex) => {
            row.map((col, colIndex) => {
                // base background color
                col.tile = new Konva.Rect({
                    y: rowIndex*tileDefaults.height + this.y,
                    x: colIndex*tileDefaults.width + this.x ,
                    ...tileRectParams[col.type]
                });
                layer.add(col.tile);
                // filling element
                col.x = new Konva.Text({
                    x: 3 + colIndex*tileDefaults.width + this.x ,
                    y: 2 + rowIndex*tileDefaults.height + this.y,
                    text: 'X',
                    fontSize: 20,
                    visible: col.type === 2
                });
                layer.add(col.x);
            });
        });
    }
}
