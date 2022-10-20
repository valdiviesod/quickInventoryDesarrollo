const router = require("express").Router();
const { isAuthenticated } = require('../helpers/auth'); //Sirve para proteger las rutas
const User = require("../models/User");
const passport = require("passport");

router.get("/users",isAuthenticated, async (req, res) => {
	const users = await User.find().lean();
	res.render("users/all-users",{users});
});

router.get('/users/edit/:id', isAuthenticated, async (req,res) =>{
    const user = await User.findById(req.params.id).lean();
    res.render('users/edit',{ user });
})

router.put('/users/update/:id', isAuthenticated, async (req,res) =>{
    const { name,email } = req.body

    await User.findByIdAndUpdate({_id: req.params.id},{
        name: name,
        email: email
    });
    req.flash('success_msg', 'Usuario actualizado');
    res.redirect('/users');
    
})
//Eliminar usuarios
router.delete('/users/delete/:id', isAuthenticated, async (req, res)=>{
    await User.findByIdAndDelete({_id: req.params.id});
    req.flash('success_msg', 'Usuario eliminado!!');
    res.redirect('/users');
});

router.get("/users/signin", (req, res) => {
	res.render("users/signin");
});

router.post("/users/signin",passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/users/signin",
		failureFlash: true,
	})
);

router.get("/users/signup", (req, res) => {
	res.render("users/signup");
});

router.post("/users/signup", async (req, res) => {
	const { name, email, password, confirm_password } = req.body;
	const errors = [];
	if (name.length == 0) {
		errors.push({ text: "Por favor, inserta tu nombre" });
	}
	if (email.length == 0) {
		errors.push({ text: "Por favor, inserta tu email" });
	}
	if (password.length == 0) {
		errors.push({ text: "Por favor, inserta una contraseña" });
	} else {
		if (confirm_password.length == 0) {
			errors.push({ text: "Por favor, confirma tu contraseña" });
		}
		if (password.length < 4) {
			errors.push({ text: "Contraseña debil" });
		}
		if (password != confirm_password) {
			errors.push({ text: "Claves no coinciden" });
		}
	}

	if (errors.length > 0) {
		res.render("users/signup", {
			errors,
			name,
			email,
			password,
			confirm_password,
		});
	} else {
		const newUser = await new User({
			name,
			email,
			password,
		});
		const emailUser = await User.findOne({ email: email });
		if (emailUser) {
			req.flash("error_msg", "Ya estas registrado!!");
			res.redirect("/users/signup");
		}
		newUser.password = await newUser.encryptPassword(password);
		await newUser.save();
		req.flash("success_msg", "Registrado!!");
		res.redirect("/users/signin");
	}
});

router.get("/users/logout", (req, res) => {
	req.logout(req.user, err => {
	  if(err) return next(err);
	  res.redirect("/");
	});
  });

module.exports = router;
