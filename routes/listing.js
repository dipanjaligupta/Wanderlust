const express = require("express");

const router = express.Router();

const wrapAsync =
  require("../utils/wrapAsync.js");

const {
  isLoggedIn,
  isOwner,
  validateListing
} = require("../middleware.js");

const listingController =
  require("../controllers/listings.js");

const multer =
  require("multer");

const {
  storage
} = require("../cloudConfig.js");

const upload =
  multer({ storage });


// ================= LISTINGS =================

router
  .route("/")

  // INDEX
  .get(
    wrapAsync(
      listingController.index
    )
  )

  // CREATE
  .post(
    isLoggedIn,

    upload.single(
      "listing[image]"
    ),

    validateListing,

    wrapAsync(
      listingController.createListing
    )
  );


// ================= NEW =================

router.get(
  "/new",

  isLoggedIn,

  listingController.renderNewForm
);


// ================= SHOW / UPDATE / DELETE =================

router
  .route("/:id")

  // SHOW
  .get(
    wrapAsync(
      listingController.showListing
    )
  )

  // UPDATE
  .put(
    isLoggedIn,

    isOwner,

    upload.single(
      "listing[image]"
    ),

    validateListing,

    wrapAsync(
      listingController.updateListing
    )
  )

  // DELETE
  .delete(
    isLoggedIn,

    isOwner,

    wrapAsync(
      listingController.destroyListing
    )
  );


// ================= EDIT =================

router.get(
  "/:id/edit",

  isLoggedIn,

  isOwner,

  wrapAsync(
    listingController.renderEditForm
  )
);


module.exports = router;