const Image = require("../models/image");

exports.imageById = (req, res, next, id) => {
    Image.findById(id).exec((error, image) => {
        if (error) {
            return res.status(400).json(error);
        } else {
            req.image = image
        }
        next();
    })
}