export class DebugOverlay{
    constructor() {
        this.overlay = this.prepareOverlay();
        this.appendOverlay();
    }

    prepareOverlay(){
        let tableContainer = document.createElement("div");
        tableContainer.style.position = "absolute";
        tableContainer.style.width = "100vw";
        tableContainer.style.minHeight = "20px";
        tableContainer.style.bottom = "0";
        tableContainer.style.padding = "10px";
        tableContainer.style.backgroundColor = "gray";
        return tableContainer;
    }

    appendOverlay(){
        document.body.append(this.overlay);
    }

    buildTable(headers, rows){
        let headerString = `<thead><tr>${headers.map((header)=>{
            return `<th>${header}</th>`;
        }).join("")}</tr></thead>`;

        let bodyString = `<tbody>${rows.map((row)=>{
            return `<tr>${row.map((cell)=>{
                return `<td>${cell}</td>`;
            }).join("")}</tr>`;
        }).join("")}</tbody>`

        this.overlay.innerHTML = `<table>${headerString}${bodyString}</table>`;

        this.overlay.querySelectorAll("tr").forEach((row) => {
            row.addEventListener("mouseenter", (e)=>{
                e.target.classList = "odd";
            });
            row.addEventListener("mouseleave",(e)=>{
                e.target.classList = "";
            });
        })
    }

    buildCustom(innerHTML){
        this.overlay.innerHTML = innerHTML;
    }

    buildTest(){
        this.overlay.innerHTML = `<table>
            <thead>
                <tr>
                    <th>id</th>
                    <th>name</th>
                    <th>rate</th>
                    <th>currency</th>
                    <th>minDeliveryDays</th>
                    <th>maxDeliveryDays</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>test</td>
                    <td>0.1</td>
                    <td>2$</td>
                    <td>2</td>
                    <td>4</td>
                </tr>
            </tbody>
        </table>`;
    }
}