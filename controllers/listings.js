const Listing = require("../models/listing");


// ================= INDEX =================

module.exports.index = async (req, res) => {

  const { search, category } = req.query;

  let filter = {};


  // ================= SEARCH FILTER =================

  if (search) {

    filter.$or = [

      // Search by title
      {
        title: {
          $regex: search,
          $options: "i"
        }
      },

      // Search by location
      {
        location: {
          $regex: search,
          $options: "i"
        }
      },

      // Search by country
      {
        country: {
          $regex: search,
          $options: "i"
        }
      }

    ];

  }


  // ================= CATEGORY FILTER =================

  if (category) {

    filter.categories = category;

  }


  // ================= GET LISTINGS =================

  const allListings = await Listing.find(filter);


  // ================= CONSOLE =================

  console.log("Search:", search);

  console.log("Category:", category);

  console.log("Results:", allListings.length);

  console.log(
    allListings.map(listing => ({
      title: listing.title,
      location: listing.location,
      country: listing.country,
      categories: listing.categories
    }))
  );


  // ================= RENDER =================

  res.render("listings/index.ejs", {

    allListings,
    search,
    category

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
        path: "author"
      }
    })
    .populate("owner");


  if (!listing) {

    req.flash(
      "error",
      "Listing you requested for does not exist"
    );

    return res.redirect("/listings");

  }


  res.render("listings/show.ejs", {
    listing
  });

};



// ================= CREATE LISTING =================

module.exports.createListing = async (req, res, next) => {

  try {

    const url = req.file.path;

    const filename = req.file.filename;


    const newListing = new Listing(
      req.body.listing
    );


    newListing.owner = req.user._id;


    newListing.image = {
      url: url,
      filename: filename
    };


    // ================= LOCATION =================

    const location = req.body.listing.location;


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

      req.flash(
        "error",
        "Location not found!"
      );

      return res.redirect("/listings/new");

    }


    const latitude = Number(data[0].lat);

    const longitude = Number(data[0].lon);


    // ================= MAP COORDINATES =================

    newListing.geometry = {

      type: "Point",

      coordinates: [
        longitude,
        latitude
      ]

    };


    // ================= SAVE =================

    await newListing.save();


    req.flash(
      "success",
      "New Listing created!"
    );


    res.redirect("/listings");


  } catch (error) {

    console.log(
      "Geocoding Error:",
      error
    );

    next(error);

  }

};



// ================= EDIT FORM =================

module.exports.renderEditForm = async (req, res) => {

  const { id } = req.params;


  const listing = await Listing.findById(id);


  if (!listing) {

    req.flash(
      "error",
      "Listing you requested for does not exist"
    );

    return res.redirect("/listings");

  }


  let originalImageUrl = listing.image.url;


  originalImageUrl = originalImageUrl.replace(
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

module.exports.updateListing = async (req, res) => {

  const { id } = req.params;


  const listing = await Listing.findByIdAndUpdate(
    id,
    {
      ...req.body.listing
    }
  );


  if (typeof req.file !== "undefined") {

    const url = req.file.path;

    const filename = req.file.filename;


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


  res.redirect(`/listings/${id}`);

};



// ================= DELETE LISTING =================

module.exports.destroyListing = async (req, res) => {

  const { id } = req.params;


  const deletedListing =
    await Listing.findByIdAndDelete(id);


  req.flash(
    "success",
    "Listing Deleted!"
  );


  console.log(deletedListing);


  res.redirect("/listings");

};