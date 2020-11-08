const formidable = require("formidable");
const _ = require("lodash");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");
const product = require("../models/product");
const fs = require("fs");
const { runInNewContext } = require("vm");
const { escapeRegExp } = require("lodash");

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    let product = new Product(fields);

    if (files.image) {
      //1kb = 1000
      if (files.image.size > 1000000) {
        return res.status(400).json({
          error: "Image should be less than 1Mb in size",
        });
      }

      //Check for all fields
      const { name, description, price, category, quantity, shipping } = fields;
      if (
        !name ||
        !description ||
        !price ||
        !category ||
        !quantity ||
        !shipping
      ) {
        return res.status(400).json({
          error: "All fields are required",
        });
      }

      product.image.data = fs.readFileSync(files.image.path);
      product.image.contentType = files.image.type;
    }

    product.save((err, result) => {
      if (err) {
        res.status(400).json({
          error: err,
        });
      } else {
        res.json({ result });
      }
    });
  });
};

exports.productById = (req, res, next, id) => {
  Product.findById(id).exec((err, product) => {
    if (err || !product) {
      return res.status(400).json({
        error: "Product not found",
      });
    }

    req.product = product;
    next();
  });
};

exports.read = (req, res) => {
  req.product.image = undefined;
  return res.json(req.product);
};

exports.remove = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  });
};

exports.update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    let product = req.product;
    //Lodash extend method
    product = _.extend(product, fields);

    if (files.image) {
      //1kb = 1000
      if (files.image.size > 1000000) {
        return res.status(400).json({
          error: "Image should be less than 1Mb in size",
        });
      }

      //Check for all fields
      const { name, description, price, category, quantity, shipping } = fields;
      if (
        !name ||
        !description ||
        !price ||
        !category ||
        !quantity ||
        !shipping
      ) {
        return res.status(400).json({
          error: "All fields are required",
        });
      }

      product.image.data = fs.readFileSync(files.image.path);
      product.image.contentType = files.image.type;
    }

    product.save((err, result) => {
      if (err) {
        res.status(400).json({
          error: err,
        });
      } else {
        res.json({ result });
      }
    });
  });
};

/**
 * sell/arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=sold&order=desc&limit=4
 * if no params, then return all products
 */

exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Product.find()
    .select("-image")
    .populate("category")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        res.status(400).json({
          error: "Products not found",
        });
      }
      res.json(data);
    });
};

/**
 * it will find the products based on the req product category
 * other products that have the same category will be returned
 */

exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;
  Product.find({ _id: { $ne: req.product }, category: req.product.category })
    .limit(limit)
    .select("-image")
    .populate("category", "_id name")
    .exec((err, products) => {
      if (err) {
        res.status(400).json({
          error: "Products not found",
        });
      }
      res.json(products);
    });
};

exports.listCategories = (req, res) => {
  Product.distinct("category", {}, (err, categories) => {
    if (err) {
      res.status(400).json({
        error: "Categories not found",
      });
    }
    res.json(categories);
  });
};

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "Price") {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.find(findArgs)
    .select("-image")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json({
        size: products.length,
        products,
      });
    });
};

exports.image = (req, res, next) => {
  if (req.product.image.data) {
    res.set('Content-Type', req.product.image.contentType);
    return res.send(req.product.image.data);
  }
  next();
}
