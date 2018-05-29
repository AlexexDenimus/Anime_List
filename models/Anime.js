var mongoose = require("mongoose");

var AnimeSchema = new mongoose.Schema({
	name: String,
	img: String,
	vimg: String,
	content: String,
	anime: String,
	comments: [
	{ 
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
	}
	],
	author: {
		
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"		
		},
		username: String
	}
});

module.exports = mongoose.model("Anime", AnimeSchema);