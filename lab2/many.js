const fs = require("fs")

const COUNT = 200
const ARRAY_SIZE = 10
const MAX_RATING = 100
const MIN_RATING = 1

const rows = [
    ["username", ...new Array(ARRAY_SIZE).fill(0).map((_, idx) => `movie#${idx+1}`)],
]

const getRandom = (min, max) => Math.floor(Math.random()*max-1)+min
const getRandomIdx = (min, max, idx) => {
    const randomValue = getRandom(min, max)
    const plusIdx = randomValue * (++idx * 0.10)
    return Math.floor(Math.min(100, plusIdx))
}


for (let i = 0; i < COUNT; i++) {
    const nextRow = new Array(ARRAY_SIZE).fill(0).map((_, idx) => getRandomIdx(MIN_RATING, MAX_RATING, idx))
    rows.push([`id#${i}`, ...nextRow])
}

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