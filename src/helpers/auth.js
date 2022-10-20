const helpers = {}
helpers.isAuthenticated = (req,res,next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error_msg','No autenticado');
    res.redirect('/users/signup');
}

module.exports = helpers;