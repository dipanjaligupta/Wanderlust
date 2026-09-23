const mongoose = require("mongoose");

const initData = require("./data.js");

const Listing = require("../models/listing.js");

const mongoose_Url = "mongodb://127.0.0.1:27017/wanderlust";


async function main() {

    await mongoose.connect(mongoose_Url);

    console.log("connect to DB");

    await initDB();

    await mongoose.connection.close();

}


const initDB = async () => {

    // Delete old listings
    await Listing.deleteMany({});

    console.log("old listings deleted");


    const listingsWithOwner = [];


    for (let obj of initData.data) {

        console.log("Finding coordinates for:", obj.location);


        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(obj.location)}&limit=1`,
            {
                headers: {
                    "User-Agent": "Wanderlust-App"
                }
            }
        );


        const data = await response.json();


        if (data.length === 0) {

            console.log(
                "Location not found:",
                obj.location
            );

            continue;
        }


        const latitude = Number(data[0].lat);

        const longitude = Number(data[0].lon);


        obj.geometry = {

            type: "Point",

            coordinates: [
                longitude,
                latitude
            ]

        };


        obj.owner = "6a6caef9e7767ddcc5b63c21";


        listingsWithOwner.push(obj);


        // Nominatim ke requests ke beech delay
        await new Promise((resolve) =>
            setTimeout(resolve, 1100)
        );

    }


    await Listing.insertMany(listingsWithOwner);


    console.log(
        `${listingsWithOwner.length} listings initialized`
    );

};


main().catch((err) => {

    console.log("ERROR:", err);

});