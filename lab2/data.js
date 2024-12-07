const fs = require("fs")


const rows = [
    ["name", "joker", "gentelmen", "card", "hollywod"],
    ["petro", 5, 4, 1, 2],
    ["oleg", null, 5,2, null],
    ["ivan", null, null, 3, 5],
    ["andrii", 3, null, 4, 5],
    ["yulia", null, null, null, 4],
    ["oksana", null, 5, 3, 3],
]

const dataStr = rows.reduce((acc, row) => {
    return acc + row.map(item => {
        if (item === null) {
            return ""
        }
        return item;
    }).join(",") + "\n"
}, "")

console.log(dataStr)
fs.writeFileSync("test.csv", dataStr)