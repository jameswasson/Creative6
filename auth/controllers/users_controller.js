var crypto = require('crypto');
var mongoose = require('mongoose'),
    User = mongoose.model('User');

var d = new Date();


function hashPW(pwd) {
    return crypto.createHash('sha256').update(pwd).
    digest('base64').toString();
}
exports.signup = function(req, res) {
    console.log("Begin exports.signup");
    var user = new User({ username: req.body.username });
    console.log("after new user exports.signup");
    user.set('hashed_password', hashPW(req.body.password));
    console.log("after hashing user exports.signup");
    user.set('email', req.body.email);
    console.log("after email user exports.signup");
    var dd = new Date();
    var t = dd.getTime();
    console.log("After getTime()");
    user.set('start_time', t);
    console.log("set time");
    user.save(function(err) {
        console.log("In exports.signup");
        console.log(err);
        if (err) {
            res.session.error = err;
            res.redirect('/signup');
        }
        else {
            req.session.user = user.id;
            req.session.username = user.username;
            req.session.msg = 'Authenticated as ' + user.username;
            req.session.start_time = user.start_time;
            res.redirect('/');
        }
    });
};
exports.login = function(req, res) {
    User.findOne({ username: req.body.username })
        .exec(function(err, user) {
            if (!user) {
                err = 'User Not Found.';
            }
            else if (user.hashed_password ===
                hashPW(req.body.password.toString())) {
                req.session.regenerate(function() {
                    console.log("login");
                    console.log(user);
                    req.session.user = user.id;
                    req.session.username = user.username;
                    req.session.msg = 'Authenticated as ' + user.username;
                    req.session.color = user.color;
                    req.session.start_time = user.start_time;
                    res.redirect('/');
                });
            }
            else {
                err = 'Authentication failed.';
            }
            if (err) {
                req.session.regenerate(function() {
                    req.session.msg = err;
                    res.redirect('/login');
                });
            }
        });
};
exports.update_time = function(req, res) {
    var id = req.body.user['_id'];
    var st = req.body.user['start_time'];
    var np = req.body.user['num_purchased'];
    console.log("start_time= " + st);
    console.log("num_purchased= " + np);
    console.log("_id= " + id);

    User.findOne({ _id: id })
        .exec(function(err, user) {
            user.set('start_time', st);
            user.set('num_purchased', np)
            user.save(function(err) {
                if (err) {
                    res.session.error = err;
                }
                else {
                    req.session.msg = 'User Updated.';
                }
            });
        });

    res.status(204).send();
};

exports.getUserProfile = function(req, res) {
    User.findOne({ _id: req.session.user })
        .exec(function(err, user) {
            if (!user) {
                res.json(404, { err: 'User Not Found.' });
            }
            else {
                res.json(user);
            }
        });
};
exports.updateUser = function(req, res) {
    User.findOne({ _id: req.session.user })
        .exec(function(err, user) {
            user.set('email', req.body.email);
            user.set('color', req.body.color);
            user.save(function(err) {
                if (err) {
                    res.session.error = err;
                }
                else {
                    req.session.msg = 'User Updated.';
                    req.session.color = req.body.color;
                }
                res.redirect('/user');
            });
        });
};
exports.deleteUser = function(req, res) {
    User.findOne({ _id: req.session.user })
        .exec(function(err, user) {
            if (user) {
                user.remove(function(err) {
                    if (err) {
                        req.session.msg = err;
                    }
                    req.session.destroy(function() {
                        res.redirect('/login');
                    });
                });
            }
            else {
                req.session.msg = "User Not Found!";
                req.session.destroy(function() {
                    res.redirect('/login');
                });
            }
        });
};
