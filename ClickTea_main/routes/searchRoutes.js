// // routes/searchRoutes.js
// const express = require("express");
// const router = express.Router();
// const { unifiedSearch } = require("../controllers/searchController");

// // ✅ Public search endpoint
// router.get("/", unifiedSearch);

// module.exports = router;
const express = require("express");
const { unifiedSearch, searchSuggestions } = require("../controllers/searchController");

const router = express.Router();

router.get("/search", unifiedSearch);
router.get("/search-suggestions", searchSuggestions);

module.exports = router;
