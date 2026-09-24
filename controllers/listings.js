const Listing = require("../models/listing");

// =====================================================
// INDEX - SHOW ALL LISTINGS / SEARCH / CATEGORY
// =====================================================

module.exports.index = async (req, res, next) => {
  try {
    const { search, category } = req.query;

    let filter = {};

    // ================= SEARCH =================

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");

      filter.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { country: searchRegex }
      ];
    }

    // ================= CATEGORY =================
    // Your schema uses "categories"

    if (category && category.trim() !== "") {
      filter.categories = category;
    }

    // ================= GET LISTINGS =================

    const allListings = await Listing.find(filter);

    console.log("Search:", search);
    console.log("Category:", category);
    console.log("Results:", allListings.length);

    console.log(
      allListings.map((listing) => ({
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

  } catch (error) {
    next(error);
  }
};


// =====================================================
// NEW FORM
// =====================================================

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};


// =====================================================
// SHOW LISTING
// =====================================================

module.exports.showListing = async (req, res, next) => {
  try {
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

  } catch (error) {
    next(error);
  }
};


// =====================================================
// CREATE LISTING
// =====================================================

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


    // ================= LOCATION CHECK =================

    const location = req.body.listing.location;

    if (!location || location.trim() === "") {
      req.flash(
        "error",
        "Please enter a location."
      );

      return res.redirect("/listings/new");
    }


    // ================= CREATE LISTING =================

    const newListing = new Listing(
      req.body.listing
    );

    newListing.owner = req.user._id;

    newListing.image = {
      url: url,
      filename: filename
    };


    // =================================================
    // NOMINATIM GEOCODING
    // =================================================

    const searchLocation = location.trim();

    const nominatimURL =
      "https://nominatim.openstreetmap.org/search" +
      `?format=jsonv2` +
      `&q=${encodeURIComponent(searchLocation)}` +
      `&limit=1`;


    console.log(
      "Geocoding location:",
      searchLocation
    );


    // ================= REQUEST =================

    const response = await fetch(
      nominatimURL,
      {
        method: "GET",

        headers: {
          "User-Agent":
            "Wanderlust-App/1.0",
          "Accept":
            "application/json",
          "Accept-Language":
            "en"
        }
      }
    );


    // ================= RESPONSE TEXT =================

    const responseText =
      await response.text();


    // =================================================
    // 403 ERROR
    // =================================================

    if (response.status === 403) {

      console.log(
        "Nominatim 403 response:"
      );

      console.log(
        responseText.substring(0, 1000)
      );

      req.flash(
        "error",
        "Location service rejected the request. Please try again later."
      );

      return res.redirect(
        "/listings/new"
      );
    }


    // =================================================
    // 429 ERROR
    // =================================================

    if (response.status === 429) {

      console.log(
        "Nominatim rate limit reached."
      );

      req.flash(
        "error",
        "Too many location requests. Please wait and try again."
      );

      return res.redirect(
        "/listings/new"
      );
    }


    // =================================================
    // OTHER HTTP ERRORS
    // =================================================

    if (!response.ok) {

      console.log(
        "Nominatim status:",
        response.status
      );

      console.log(
        "Nominatim response:",
        responseText.substring(0, 1000)
      );

      throw new Error(
        `Nominatim request failed: ${response.status}`
      );
    }


    // =================================================
    // PARSE JSON
    // =================================================

    let data;

    try {

      data = JSON.parse(
        responseText
      );

    } catch (error) {

      console.log(
        "Nominatim returned invalid JSON:"
      );

      console.log(
        responseText.substring(0, 1000)
      );

      throw new Error(
        "Nominatim did not return valid JSON."
      );
    }


    // =================================================
    // LOCATION NOT FOUND
    // =================================================

    if (
      !data ||
      data.length === 0
    ) {

      req.flash(
        "error",
        "Location not found! Please enter a valid location."
      );

      return res.redirect(
        "/listings/new"
      );
    }


    // =================================================
    // GET COORDINATES
    // =================================================

    const latitude =
      Number(data[0].lat);

    const longitude =
      Number(data[0].lon);


    console.log(
      "Latitude:",
      latitude
    );

    console.log(
      "Longitude:",
      longitude
    );


    // =================================================
    // VALIDATE COORDINATES
    // =================================================

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {

      throw new Error(
        "Invalid coordinates received from Nominatim."
      );
    }


    // =================================================
    // SAVE GEOJSON
    // =================================================

    // IMPORTANT:
    // GeoJSON format:
    // [longitude, latitude]

    newListing.geometry = {
      type: "Point",

      coordinates: [
        longitude,
        latitude
      ]
    };


    console.log(
      "Map coordinates:",
      newListing.geometry.coordinates
    );


    // =================================================
    // SAVE LISTING
    // =================================================

    await newListing.save();


    console.log(
      "Listing saved successfully:",
      newListing._id
    );


    // =================================================
    // SUCCESS
    // =================================================

    req.flash(
      "success",
      "New Listing created!"
    );

    res.redirect(
      `/listings/${newListing._id}`
    );

  } catch (error) {

    console.error(
      "Create Listing Error:",
      error
    );

    next(error);
  }
};


// =====================================================
// EDIT FORM
// =====================================================

module.exports.renderEditForm = async (req, res, next) => {
  try {

    const { id } = req.params;

    const listing =
      await Listing.findById(id);


    if (!listing) {

      req.flash(
        "error",
        "Listing you requested for does not exist"
      );

      return res.redirect(
        "/listings"
      );
    }


    // ================= IMAGE URL =================

    let originalImageUrl =
      listing.image?.url || "";


    if (originalImageUrl) {

      originalImageUrl =
        originalImageUrl.replace(
          "/upload",
          "/upload/h_200,w_250"
        );
    }


    // ================= RENDER =================

    res.render(
      "listings/edit.ejs",
      {
        listing,
        originalImageUrl
      }
    );

  } catch (error) {
    next(error);
  }
};


// =====================================================
// UPDATE LISTING
// =====================================================

module.exports.updateListing = async (req, res, next) => {
  try {

    const { id } = req.params;


    // =================================================
    // UPDATE BASIC DETAILS
    // =================================================

    const listing =
      await Listing.findByIdAndUpdate(
        id,
        {
          ...req.body.listing
        },
        {
          new: true,
          runValidators: true
        }
      );


    if (!listing) {

      req.flash(
        "error",
        "Listing you requested for does not exist"
      );

      return res.redirect(
        "/listings"
      );
    }


    // =================================================
    // UPDATE IMAGE
    // =================================================

    if (req.file) {

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


    // =================================================
    // UPDATE LOCATION / GEOMETRY
    // =================================================

    const newLocation =
      req.body.listing.location;

    if (
      newLocation &&
      newLocation.trim() !== ""
    ) {

      try {

        const searchLocation =
          newLocation.trim();


        const nominatimURL =
          "https://nominatim.openstreetmap.org/search" +
          `?format=jsonv2` +
          `&q=${encodeURIComponent(searchLocation)}` +
          `&limit=1`;


        console.log(
          "Updating coordinates for:",
          searchLocation
        );


        const response =
          await fetch(
            nominatimURL,
            {
              method: "GET",

              headers: {
                "User-Agent":
                  "Wanderlust-App/1.0",

                "Accept":
                  "application/json",

                "Accept-Language":
                  "en"
              }
            }
          );


        if (response.ok) {

          const data =
            await response.json();


          if (
            data &&
            data.length > 0
          ) {

            const latitude =
              Number(data[0].lat);

            const longitude =
              Number(data[0].lon);


            if (
              Number.isFinite(latitude) &&
              Number.isFinite(longitude)
            ) {

              listing.geometry = {
                type: "Point",

                coordinates: [
                  longitude,
                  latitude
                ]
              };


              await listing.save();


              console.log(
                "Updated coordinates:",
                listing.geometry.coordinates
              );
            }
          }

        } else {

          console.log(
            "Nominatim update failed:",
            response.status
          );
        }

      } catch (geoError) {

        console.log(
          "Geocoding update error:",
          geoError.message
        );
      }
    }


    // =================================================
    // SUCCESS
    // =================================================

    req.flash(
      "success",
      "Listing updated successfully!"
    );


    res.redirect(
      `/listings/${id}`
    );

  } catch (error) {

    console.error(
      "Update Listing Error:",
      error
    );

    next(error);
  }
};


// =====================================================
// DELETE LISTING
// =====================================================

module.exports.destroyListing = async (req, res, next) => {
  try {

    const { id } = req.params;


    const deletedListing =
      await Listing.findByIdAndDelete(id);


    if (!deletedListing) {

      req.flash(
        "error",
        "Listing not found"
      );

      return res.redirect(
        "/listings"
      );
    }


    console.log(
      "Deleted Listing:",
      deletedListing._id
    );


    req.flash(
      "success",
      "Listing Deleted!"
    );


    res.redirect(
      "/listings"
    );

  } catch (error) {

    console.error(
      "Delete Listing Error:",
      error
    );

    next(error);
  }
};