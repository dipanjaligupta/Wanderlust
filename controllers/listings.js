const Listing = require("../models/listing");

// ================= INDEX =================

module.exports.index = async (req, res) => {
  const { search, category } = req.query;

  let filter = {};

  // ================= SEARCH FILTER =================

  if (search) {
    filter.$or = [
      {
        title: {
          $regex: search,
          $options: "i"
        }
      },
      {
        location: {
          $regex: search,
          $options: "i"
        }
      },
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

    // ================= IMAGE CHECK =================

    if (!req.file) {
      req.flash(
        "error",
        "Image upload failed! Please select an image."
      );

      return res.redirect("/listings/new");
    }

    const url = req.file.path;
    const filename = req.file.filename;

    // ================= CREATE LISTING =================

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

    if (!location) {
      req.flash(
        "error",
        "Please enter a location."
      );

      return res.redirect("/listings/new");
    }

    // ================= NOMINATIM API =================

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
      {
        headers: {
          "User-Agent": "Wanderlust-App/1.0"
        }
      }
    );

    // Check HTTP response

    if (!response.ok) {
      throw new Error(
        `Nominatim request failed: ${response.status}`
      );
    }

    // Check response type

    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {

      const text = await response.text();

      console.log(
        "Nominatim returned:",
        text.substring(0, 300)
      );

      throw new Error(
        "Nominatim did not return JSON"
      );
    }

    // Convert response to JSON

    const data = await response.json();

    // ================= LOCATION NOT FOUND =================

    if (data.length === 0) {

      req.flash(
        "error",
        "Location not found!"
      );

      return res.redirect("/listings/new");
    }

    // ================= COORDINATES =================

    const latitude = Number(data[0].lat);
    const longitude = Number(data[0].lon);

    // ================= MAP GEOMETRY =================

    newListing.geometry = {
      type: "Point",
      coordinates: [
        longitude,
        latitude
      ]
    };

    // ================= SAVE =================

    await newListing.save();

    // ================= SUCCESS =================

    req.flash(
      "success",
      "New Listing created!"
    );

    res.redirect("/listings");

  } catch (error) {

    console.log(
      "Create Listing Error:",
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