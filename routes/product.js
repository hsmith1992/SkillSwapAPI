const express = require("express");
const router = express.Router();
const {
  create,
  productById,
  read,
  remove,
  list,
  listRelated,
  update,
  listCategories,
  listBySearch,
  image,
} = require("../controllers/product");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { route } = require("./category");

router.post("/product/create/:userId", requireSignin, isAuth, create);
router.delete(
  "/product/:productId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  remove
);
router.get("/product/:productId", read);
router.put(
  "/product/:productId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  update
);
router.get("/products", list);
router.get("/products/related/:productId", listRelated);
router.get("/products/categories", listCategories);
router.get("/product/image/:productId", image);
router.post("/products/by/search", listBySearch);

router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
