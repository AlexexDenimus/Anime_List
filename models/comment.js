var mongoose = require("mongoose");

var CommentSchema = new mongoose.Schema({
	author: {
		username: String,
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"		
		}
	},
	text: String
});

module.exports = mongoose.model("Comment", CommentSchema);