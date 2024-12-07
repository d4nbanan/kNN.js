const fs = require('fs');


const generate = (users) => {
    const sample = [];

    for(let i=1; i<users+1; i++) {
        // const user = {};

        const user = {
            _id: "63d8f474044e8f6a5fec08e9",
            mobileNumber: '+380 97 736 4536',
            roles: [ 'user' ],
            username: 'Danish M',
            email: 'danbanan88@gmail.com',
            emailConfirmed: true,
            acceptNotifications: false,
            sessions: [],
            lastActivity: "2023-01-31T10:57:00.405Z",
            // addresses: [ new ObjectId("63d8f474044e8f6a5fec08e8") ],
            createdAt: "2023-01-31T10:59:00.643Z",
            updatedAt: "2023-02-01T04:21:13.954Z",
            __v: 9,
            sessionTerminationTimeframe: '6months',
            // reactions: []
        }

        user.id = "user" + i;
        const favouritesLength = 1000 + Math.floor(Math.random() * 10);
        const favourites = [];
        for(let j=0; j<favouritesLength; j++) {
            // let key = 'f';
            // key += Number(j+i);
            // const obj = {};
            const obj = {
                asset: {
                    Symbol: `f${j+i}`
                },
                value: j%2 === 0 ? true : false
            };
            // if(j%2 === 0) {
            //     obj[key] = true;
            // } else {
            //     obj[key] = false;
            // }
            favourites.push(obj);
        }
        // user.favourites = favourites;
        user.reactions = favourites;
        sample.push(user);
    }

    fs.writeFileSync('sample.json', JSON.stringify(sample));
    console.log("ok");
}

generate(1000);