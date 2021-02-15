const User = require("../models/user");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const swap = require("../models/swap");
//const e = require("express"); Remove if no effect

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: "User not found" });
    } else {
      req.profile = user;
    }
    next();
  });
};

exports.updateProfile = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    let profile = req.profile;
    //Lodash extend method
    profile = _.extend(profile, fields);

    if (files.profilePicture) {
      //1kb = 1000
      if (files.profilePicture.size > 1000000) {
        return res.status(400).json({
          error: "Image should be less than 1Mb in size",
        });
      }

      //Check for all fields
      const { firstname, secondname, email } = profile;
      if (
        !firstname ||
        !secondname ||
        !email
      ) {
        return res.status(400).json({
          error: "All fields are required",
        });
      }
      profile.profilePicture.data = fs.readFileSync(files.profilePicture.path);
      profile.profilePicture.contentType = files.profilePicture.type;
    }

    profile.save((err, result) => {
      if (error) {
        res.status(400).json({ error });
      } else {
        res.json({ result });
      }
    });
  });
};

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  req.profile.profilePicture = undefined;
  return res.json(req.profile);
};

exports.publicRead = (req, res) => {
  User.findById(req.params.userId2).exec((error, user) => {
    if (error) return res.status(400).json(error);
    user.hashed_password = user.salt = user.role = user.profilePicture = user.address = user.email = user.swapHistory = user.currentSwaps = undefined;
    res.json(user);
  })
}

exports.update = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "You are not authorised to perform this action",
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    }
  );
};

exports.profilePicture = (req, res) => {
  if (req.profile.profilePicture.data) {
    res.set('Content-Type', req.profile.profilePicture.contentType);
    return res.send(req.profile.profilePicture.data);
  }
}

exports.updateSkills = (req, res) => {
  let skill = {
    skill: req.skill,
    level: req.body.level,
    completed: 0,
  }

  let skills = req.profile.skills.map(i => i.skill._id);
  if (skills.includes(req.skill._id)) {
    User.findOneAndUpdate(
      { _id: req.profile._id, "skills.skill._id": req.skill._id },
      { $set: { "skills.$.level": skill.level } },
      (error, a) => {
        if (error) {
          return res.status(400).json({ error });
        }
        res.json(a)
      })
  } else {
    User.findOneAndUpdate(
      { _id: req.profile._id },
      { $addToSet: { skills: skill } },
      (err, user) => {
        if (err) {
          return res.status(400).json({
            error: "You are not authorised to perform this action",
          });
        }
        res.json(user.skills);
      }
    );
  }
};

exports.removeSkill = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $pull: { "skills": { "skill._id": req.skill._id } } }, { new: true },
    (error) => { res.status(400).json({ error }) }
  )
  res.json({ msg: "Skill Removed" });
}

exports.updateInterests = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { interests: req.body },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "You are not authorised to perform this action",
        });
      }
      res.json(user.interests);
    }
  );
};

exports.updateAddress = (req, res) => {
  let { houseNo, street, town, area, postcode } = req.body;
  if (!houseNo || !street || !town || !area || !postcode) {
    return res.status(400).json({
      error: "All fields are required"
    })
  }

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { address: req.body },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "You are not authorised to perform this action",
        });
      }
      res.json(user.address);
    }
  );
};

exports.address = (req, res) => {
  return res.json(req.profile.address);
}

exports.skills = (req, res) => {
  return res.json(req.profile.skills);
}

exports.interests = (req, res) => {
  return res.json(req.profile.interests);
}
exports.about = (req, res) => {
  return res.json(req.profile.about);
}

exports.updateAbout = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { about: req.body.about },
    { new: true },
    (error, user) => {
      if (error) {
        return res.status(400).json({
          error
        })
      }
      res.json(user.about);
    }
  )
}