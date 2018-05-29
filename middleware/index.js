var Anime = require("../models/Anime"),
	Comment = require("../models/Comment");

var middle = {};

middle.IsLoggin = function(req, res, next){
	if (req.isAuthenticated()){
		return next();
	}
	else{
		req.flash("error", "Please Login first!!!")
		res.redirect("back");
		//$('#login').modal('show');
	}
};

middle.IsPersOwn = function(req, res, next){
	if (req.isAuthenticated()){
		Anime.findById(req.params.id, function(err, pers){
			if (err) console.log(err);
			else {
				if (pers.author.id.equals(req.user._id)){
					next();
				}
				else {
					req.flash("error", "You don't own this!")
					res.redirect('back');
				}
			}
		});
	}
	else {
				// show login
		req.flash("error", "Please Login first!!!")
		res.redirect("back");
	}
};

middle.IsComOwn = function(req, res, next){
	if (!req.isAuthenticated()){
		// show login
		req.flash("error", "Please Login first!!!")
		res.redirect("/");
	}
	else {
		Anime.findById(req.params.id, function(err, pers){
			if (err) console.log(err);
			else {
				Comment.findById(req.params.cid, function(err, com){
					if (err) console.log(err);
					else {
						if (com.author.id.equals(req.user._id)){
							next();
						}
						else {
							req.flash("error", "You don't own this!")
							res.redirect('back');
						}
					}
				});
			}
		});
	}
};

module.exports = middle;