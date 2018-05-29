var express = require("express");
	bodyparse = require("body-parser"),
	mongoose = require("mongoose"),
	method = require("method-override"),
	Anime = require("./models/Anime"),
	Comment = require("./models/Comment"),
	User = require("./models/user"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	flash = require("connect-flash"),
	jsdom = require("jsdom"),
	dom = new jsdom.JSDOM(`<!DOCTYPE html>`),
	$ = require("jquery")(dom.window),
	middleware = require("./middleware"),
	//bootstrap = require("bootstrap"),
    app = express(),
    port = 8000;


app.use(bodyparse.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(method("_method"));
app.use(flash());
mongoose.connect('mongodb://localhost/animelist');
app.use(require("express-session")({
	secret: "Anime#1",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

// Home

app.get("/", function(req, res){
	res.render("home.ejs");
});

// List + unical

app.get("/anime_list", function(req, res){
	Anime.find({}, function(err, pers){
		if (err) console.log(err);
		else res.render("Anime/anime.ejs", { pers: pers });
	});
});

app.get("/anime_list/new", middleware.IsLoggin, function(req, res){
	
	res.render("Anime/new.ejs");
});

app.post("/anime_list", middleware.IsLoggin, function(req, res){
	var plusone = {
		name: req.body.name,
		anime: req.body.anime,
		img: req.body.img,
		vimg: req.body.vimg,
		content: req.body.content,
		author: {
			id: req.user._id,
			username: req.user.username
		}
	};
	Anime.create(plusone, function(err, pers){
		if (err) {
			console.log(err);
			req.flash("error", err);
			res.render("back");
		}
		else {
			console.log(pers);
			req.flash("success", "Character was successfuly created!");
			res.redirect("anime_list");
		}
	});
});

app.get("/anime_list/:id", function(req, res){
	Anime.findById(req.params.id).populate("comments").exec((err, pers) => {
		if (err) console.log(err);
		else res.render("Anime/uniq.ejs", {pers: pers});
	});
});

app.delete("/anime_list/:id", middleware.IsPersOwn, function(req, res){
	Anime.findByIdAndRemove(req.params.id, function(err){
		if (err) {
			console.log(err);
			req.flash("error", err);
			res.render("back");
		}
		else {
			req.flash("success", "Character was successfuly deleted!");
			res.redirect("/anime_list");
		}
	});
});

app.get("/anime_list/:id/edit", middleware.IsPersOwn, function(req, res){
	Anime.findById(req.params.id, function(err, pers){
		if (err) console.log(err);
		else res.render("Anime/edit.ejs", {pers: pers});
	});
});

app.put("/anime_list/:id", middleware.IsPersOwn, function(req, res){
	Anime.findByIdAndUpdate(req.params.id, req.body.hero, function(err, pers){
		if (err) {
			req.flash("error", err);
			res.render("back");
			console.log(err);
		}
		else {
			req.flash("success", "Character was successfuly changed!");
			res.redirect("/anime_list/" + req.params.id);
		}
	});
});

// Comments

app.post("/anime_list/:id/comment", middleware.IsLoggin, function(req, res){
	Anime.findById(req.params.id, function(err, pers){
		if (err) console.log(err);
		else {
			var pluscomment = {
				text: req.body.comments.text,
				author: {
					id: req.user._id,
					username: req.user.username
				}
			};
			Comment.create(pluscomment, function(err, com){
				if (err) console.log(err);
				else{
					pers.comments.push(com);
					pers.save();
					res.redirect("/anime_list/" + req.params.id);
				}
			});
		}
	});
});

app.delete("/anime_list/:id/comment/:cid", middleware.IsComOwn, function(req, res){
	Anime.findById(req.params.id, function(err, pers){
		if (err) console.log(err);
		else {
			Comment.findByIdAndRemove(req.params.cid, function(err, com){
				if (err) console.log(err);
				else {
					pers.save();
					res.redirect("/anime_list/" + req.params.id);
				}
			});
		}
	});
});

// USER

app.post('/login', passport.authenticate('local', {successRedirect: 'back',
                                   failureRedirect: '/',
                                   failureFlash: true }), function(req, res){

});

app.post("/register", function(req, res){
	User.register(new User({username: req.body.username}), req.body.password, function(err, user){
		if (err) {
			req.flash("error", err);
			res.redirect("/");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to us!!!");
			res.redirect("/");
		});
	});
});

app.get('/logout', function(req, res){
  req.logout();
  req.flash("success", "Goodbye! We will be waiting you!");
  res.redirect('/');
});

app.listen(port, (err) => {
	if (err) console.log("smth went wrong" + err);
	else console.log("Welcome!");
})