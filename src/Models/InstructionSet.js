
export class InstructionSet{
    constructor(data) {
        this.width = data.width;
        this.height = data.height;
        this.top = data.instructions.top;
        this.left = data.instructions.left;
        this.fillsRequired = {
            top: 0,
            left: 0
        }

        //validate first level
        if(this.top.length !== this.width
            || this.left.length !== this.height){
            throw "instruction length mismatch";
        }

        this.PopulateInstructions();
    }

    PopulateInstructions(){
        // populate top instructions
        this.top = this.top.map((line) => {
            let sum = 0;
            let newLine = line.map((tile) =>{
                sum+=tile;
                return {
                    number: tile,
                    crossed: false,
                }
            })
            this.ValidateLine(sum, line.length, this.width);

            this.fillsRequired.top += sum;
            return newLine;
        })
        // populate left instructions
        this.left = this.left.map((line) => {
            let sum = 0;
            let newLine = line.map((tile) =>{
                sum+=tile;
                return {
                    number: tile,
                    crossed: false,
                }
            })
            this.ValidateLine(sum, line.length, this.height);

            this.fillsRequired.left += sum;

            return newLine;
        })

        if(this.fillsRequired.top !== this.fillsRequired.left){
            console.log(this.fillsRequired);
            throw "instruction length mismatch"

        }
    }

    ValidateLine(sum, count, length){
        // add min cross count
        sum+= (count - 1);
        if(sum > length){
            throw "instruction length mismatch"
        }
    }
}