const Listing = require("../models/listing");


// ================= INDEX =================

module.exports.index = async (req, res) => {

  const allListings = await Listing.find({});

  res.render("listings/index.ejs", {
    allListings
  });

};


// ================= NEW FORM =================

module.exports.renderNewForm = (req, res) => {

  res.render("listings/new.ejs");

};


// ================= SHOW LISTING =================

module.exports.showListing = async (req, res) => {

  const { id } = req.params;

  const listing = await Listing.findById(id)

    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })

    .populate("owner");


  if (!listing) {

    req.flash(
      "error",
      "Listing you requested for does not exist"
    );

    return res.redirect("/listings");

  }


  console.log(listing);

  res.render("listings/show.ejs", {
    listing
  });

};


// ================= CREATE LISTING =================

module.exports.createListing = async (req, res, next) => {

  try {

    // Image
    const url = req.file.path;

    const filename = req.file.filename;


    // Create listing
    const newListing = new Listing(
      req.body.listing
    );


    // Owner
    newListing.owner = req.user._id;


    // Image
    newListing.image = {
      url: url,
      filename: filename
    };


    // ================= LOCATION =================

    const location =
      req.body.listing.location;


    console.log(
      "Searching location:",
      location
    );


    // OpenStreetMap Nominatim API
    const response = await fetch(

      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,

      {
        headers: {
          "User-Agent": "Wanderlust-App"
        }
      }

    );


    const data = await response.json();


    // Location not found
    if (data.length === 0) {

      req.flash(
        "error",
        "Location not found!"
      );

      return res.redirect(
        "/listings/new"
      );

    }


    // ================= COORDINATES =================

    const latitude =
      Number(data[0].lat);

    const longitude =
      Number(data[0].lon);


    // Save geometry
    newListing.geometry = {

      type: "Point",

      // IMPORTANT:
      // longitude first
      // latitude second

      coordinates: [
        longitude,
        latitude
      ]

    };


    // ================= CONSOLE =================

    console.log(
      "Location:",
      location
    );

    console.log(
      "Longitude:",
      longitude
    );

    console.log(
      "Latitude:",
      latitude
    );

    console.log(
      "Coordinates:",
      [
        longitude,
        latitude
      ]
    );


    // ================= SAVE =================

    await newListing.save();


    req.flash(
      "success",
      "New Listing created!"
    );


    res.redirect("/listings");

  }

  catch (error) {

    console.log(
      "Geocoding Error:",
      error
    );

    next(error);

  }

};


// ================= EDIT FORM =================

module.exports.renderEditForm = async (
  req,
  res
) => {

  const { id } = req.params;


  const listing =
    await Listing.findById(id);


  if (!listing) {

    req.flash(
      "error",
      "Listing you requested for does not exist"
    );

    return res.redirect("/listings");

  }


  let originalImageUrl =
    listing.image.url;


  originalImageUrl =
    originalImageUrl.replace(
      "/upload",
      "/upload/h_200,w_250"
    );


  res.render(
    "listings/edit.ejs",
    {
      listing,
      originalImageUrl
    }
  );

};


// ================= UPDATE LISTING =================

module.exports.updateListing = async (
  req,
  res
) => {

  const { id } = req.params;


  const listing =
    await Listing.findByIdAndUpdate(
      id,
      {
        ...req.body.listing
      }
    );


  if (
    typeof req.file !== "undefined"
  ) {

    const url =
      req.file.path;

    const filename =
      req.file.filename;


    listing.image = {
      url,
      filename
    };


    await listing.save();

  }


  req.flash(
    "success",
    "Listing updated"
  );


  res.redirect(
    `/listings/${id}`
  );

};


// ================= DELETE LISTING =================

module.exports.destroyListing = async (
  req,
  res
) => {

  const { id } = req.params;


  const deletedListing =
    await Listing.findByIdAndDelete(id);


  req.flash(
    "success",
    "Listing Deleted!"
  );


  console.log(
    deletedListing
  );


  res.redirect("/listings");

};