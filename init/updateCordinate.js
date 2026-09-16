const mongoose = require("mongoose");

const Listing = require("../models/listing.js");

const mongoose_Url =
  "mongodb://127.0.0.1:27017/wanderlust";


async function main() {

  await mongoose.connect(mongoose_Url);

  console.log("Connected to DB");


  // Sirf old listings jinme geometry nahi hai
  const listings = await Listing.find({
    geometry: { $exists: false }
  });


  console.log(
    `Found ${listings.length} listings without coordinates`
  );


  for (let listing of listings) {

    const location =
      `${listing.location}, ${listing.country}`;


    console.log(
      `Searching: ${location}`
    );


    try {

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
        {
          headers: {
            "User-Agent": "Wanderlust-App"
          }
        }
      );


      const data = await response.json();


      if (data.length === 0) {

        console.log(
          `Location not found: ${location}`
        );

        continue;

      }


      const latitude =
        Number(data[0].lat);

      const longitude =
        Number(data[0].lon);


      listing.geometry = {

        type: "Point",

        coordinates: [
          longitude,
          latitude
        ]

      };


      await listing.save();


      console.log(
        `Updated: ${listing.title}`
      );

      console.log(
        "Coordinates:",
        [longitude, latitude]
      );


      // Nominatim ko overload na karein
      await new Promise(
        resolve => setTimeout(resolve, 1100)
      );

    }

    catch (error) {

      console.log(
        `Error: ${location}`,
        error.message
      );

    }

  }


  console.log(
    "All old listings updated!"
  );


  await mongoose.connection.close();

}


main()
  .catch((err) => {

    console.log(err);

  });