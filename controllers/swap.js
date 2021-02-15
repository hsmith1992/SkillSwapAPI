const Swap = require("../models/swap");
const Image = require("../models/image");
const formidable = require("formidable");
const fs = require("fs");
const { requireSignin } = require("./auth");


exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (error, fields, files) => {
        if (error) {
            return res.status(400).json({ error })
        }

        const { creator, participant } = fields;
        if (!creator, !participant) {
            return res.status(400).json({ error: "Missing creator or participant" })
        }
        if (files) {
            //1kb = 1000
            for (let image in files) {
                if (files[image].size > 2000000) {
                    return res.status(400).json({
                        error: "Image should be less than 2Mb in size"
                    })
                }
            }
        }

        const swap = new Swap(fields)

        swap.images = []
        for (let i in files) {
            let data = fs.readFileSync(files[i].path);
            let contentType = files[i].type;
            let name = files[i].name;
            const image = new Image({ data, contentType, name, createdBy: req.profile._id });
            image.save((error, result) => { if (error) { return res.status(400).json(error) } });
            swap.images.push(image);
        }
        swap.save((error, result) => {
            if (error) {
                return res.status(400).json({ error });
            } else {
                res.json({ result });
            }
        })
    })
}

exports.read = (req, res) => {
    return res.json(req.swap);
}

exports.swapById = (req, res, next, id) => {
    Swap.findById(id).exec((error, swap) => {
        if (error) {
            return res.status(400).json(error);
        } else {
            req.swap = swap
        }
        next();
    })
}

exports.isParticipant = (req, res, next) => {
    let participant = req.swap.creator._id.equals(req.profile._id) || req.swap.participant._id.equals(req.profile._id);
    if (!participant) {
        return res.status(403).json({
            error: "Access Denied"
        })
    }
    next();
}

exports.images = (req, res) => {
    if (req.swap.images) {
        let images = req.swap.images.map(image => image._id);
        return res.json(images);
    }

}

exports.image = (req, res) => {
    res.set("Content-Type", req.image.contentType)
    return res.send(req.image.data)
}

exports.chat = (req, res) => {
    return res.json(req.swap.chat);
}

exports.swapOffer = (req, res) => {
    let swap = req.swap;
    swap.swapOffer = req.body;
    swap.save((error, result) => {
        if (error) return res.status(400).json(error);
        return res.json(result.swapOffer);
    })
}

exports.sendMessage = (req, res) => {
    message = {
        owner: req.profile._id,
        message: req.body.message
    }
    let swap = req.swap;
    swap.chat.push(message);
    swap.save((error, result) => {
        if (error) return res.status(400).json(error);
        return res.json(result.chat);
    })
}