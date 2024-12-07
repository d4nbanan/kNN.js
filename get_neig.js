const fs = require('fs');

const get_neig2 = (dataFrame, userId, k) => { // 20 sec: 1000 users, ~1000 reactions
    const data = [...dataFrame];
    const forUserIndex = data.findIndex(user => user.id === userId)
    if(forUserIndex === -1) return "user not found";
    const forUser = {...data[forUserIndex]};
    data.splice(forUserIndex, 1);

    let sumRatingForUser = 0;
    for(let j=0; j<forUser.reactions.length; j++) {
        sumRatingForUser += forUser.reactions[j].value;
    }
    const avRatingForUser = sumRatingForUser / forUser.reactions.length;

    const res = {
        kNN: [],
        forUser
    };

    for(let i=0; i<data.length; i++) {

        let sumRating = 0;
        for(let j=0; j<data[i].reactions.length; j++) {
            sumRating += data[i].reactions[j].value;
        }
        const avRating = sumRating / data[i].reactions.length;

        let sum1 = 0;
        let sum2 = 0;
        let sum3 = 0;

        const userReactions = {};
        for(let j=0; j<data[i].reactions.length; j++) {
            userReactions[data[i].reactions[j].name] = data[i].reactions[j];
        }
        
        for(let f=0; f<forUser.reactions.length; f++) { // 0.2 sec
            isDefined = userReactions[forUser.reactions[f].name]
            if(isDefined) {
                sum1 += (forUser.reactions[f].value - avRatingForUser) * (isDefined.value - avRating);
                sum2 += Math.pow(forUser.reactions[f].value - avRatingForUser, 2);
                sum3 += Math.pow(isDefined.value - avRating, 2);
            }
            
            // const isDefinedIndex = data[i].reactions.findIndex(fav => fav.name === forUser.reactions[f].name); // 2 sec
            
            // if(isDefinedIndex !== -1) {
            //     sum1 += (forUser.reactions[f].value - avRatingForUser) * (data[i].reactions[isDefinedIndex].value - avRating);
            //     sum2 += Math.pow(forUser.reactions[f].value - avRatingForUser, 2);
            //     sum3 += Math.pow(data[i].reactions[isDefinedIndex].value - avRating, 2);
            // }
        }

        const w = sum1 / (Math.sqrt(sum2) * Math.sqrt(sum3));
        // console.log(w)

        res.kNN.push({
            avRating,
            w,
            user: data[i]
        });

    }
    
    res.kNN = res.kNN.sort((a, b) => {
        return b.w - a.w;
    }).slice(0, k);

    res.forUser.avRatingForUser = avRatingForUser;

    return res;

}

const data = JSON.parse(fs.readFileSync('sample.json'));

console.log(new Date().getTime())
const {kNN, forUser} = get_neig2(data, "user21", 5);
console.log(new Date().getTime())

console.log(kNN)




const getRecomendations = (neigs, forUser, minRating = 0.8, amount = 1, forIgnore = []) => {
    let reactionsList = {};

    for(let i=0; i<neigs.length; i++) {
        for(let j=0; j<neigs[i].user.reactions.length; j++) {
            const isDefined = forUser.reactions.find(fav => fav.asset.Symbol === neigs[i].user.reactions[j].asset.Symbol);
            const toIgnore = forIgnore.find(ignore => ignore === neigs[i].user.reactions[j].asset.Symbol);
            if(isDefined || toIgnore) continue;

            reactionsList[neigs[i].user.reactions[j].asset.Symbol] = reactionsList[neigs[i].user.reactions[j].asset.Symbol] ? 
                [...reactionsList[neigs[i].user.reactions[j].asset.Symbol], neigs[i].user.id] : [neigs[i].user.id];
        }
    }
    // reactionsList = Object.values(reactionsList);

    const res = [];

    for(let favourite in reactionsList) {
        let sum1 = 0;
        let sum2 = 0;

        for(let userId of reactionsList[favourite]) {
            const user = neigs.find(neig => neig.user.id === userId);
            const rating = user.user.reactions.find(fav => fav.asset.Symbol === favourite).value;
            
            sum1 += (rating - user.avRating) * user.w;
            sum2 += Math.abs(user.w);
        }

        const predictedRating = forUser.avRatingForUser + sum1 / sum2;
        
        if(predictedRating >= minRating) {
            res.push({
                name: favourite,
                predictedRating
            });
        }
    }

    return res;

}

console.log(getRecomendations(kNN, forUser, 1, 20, ["f11", "f13", "f15"]));












const get_neig = (data, userId, k) => { // 20 sec: 1000 users, ~1000 favourites
    const dataFrame = [...data];
    const forUserIndex = dataFrame.findIndex(user => user.id === userId)
    if(forUserIndex === -1) return "user not found";
    const forUser = {...dataFrame[forUserIndex]};
    dataFrame.splice(forUserIndex, 1);

    const coincidentes = [];
    for(let i=0; i<dataFrame.length; i++) {

        let coincidenteNumber = 0;
        for(let j=0; j<forUser.favourites.length; j++) {
            const coincidentedFavouriteIndex = dataFrame[i].favourites.findIndex(favourite => Object.keys(favourite)[0] === Object.keys(forUser.favourites[j])[0]);

            if(coincidentedFavouriteIndex !== -1) {
                if(Object.values(dataFrame[i].favourites[coincidentedFavouriteIndex])[0] === Object.values(forUser.favourites[j])[0]) {
                    coincidenteNumber++;
                }
            }
        }

        // const addIndex = coincidentes.findIndex(coincidate => coincidenteNumber >= coincidate.coincidentes)

        // if(addIndex === -1) {
        //     coincidentes.push({
        //         userId: dataFrame[i].id,
        //         coincidentes: coincidenteNumber
        //     });
        // } else {
        //     coincidentes.splice(addIndex, 0, {
        //         userId: dataFrame[i].id,
        //         coincidentes: coincidenteNumber
        //     });
        // }

        // without sorting
        coincidentes.push({
            userId: dataFrame[i].id,
            coincidentes: coincidenteNumber
        });

    }

    return coincidentes.sort((a, b) => {
        return a.coincidentes - b.coincidentes;
    });

    // return coincidentes.slice(0, k)
}

// const data = JSON.parse(fs.readFileSync('sample.json'));
// console.log(new Date().getTime())
// const neighbors = get_neig(data, "user21", 10);
// console.log(neighbors)
// console.log(new Date().getTime())

const getRecommended = (neighbors, forUserId) => {
    const forUserIndex = data.findIndex(user => user.id === forUserId)
    if(forUserIndex === -1) return "user not found";
    const forUser = {...data[forUserIndex]};

    const ignoreFavourites = forUser.favourites;

    for(let i=0; i<neighbors.length; i++) {
        const user = data.find(neighbor => neighbor.id === neighbors[i].userId);
        
        for(let j=0; j<user.favourites.length; j++) {
            const ignoreFavourite = ignoreFavourites.find(ignore => Object.keys(ignore)[0] === Object.keys(user.favourites[j])[0]);

            if(!ignoreFavourite && Object.values(user.favourites[j])[0]) {
                return user.favourites[j];
            }
        }

    }
}

// console.log(getRecommended(neighbors, "user21"));