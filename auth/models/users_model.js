var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var UserSchema = new Schema({
    username: { type: String, unique: true },
    email: String,
    color: String,
    start_time: Number,
    hashed_password: String,
    current_rate: { type: Number, default: 1},
    num_purchased: {type: Array, default: [0,0,0,0]}
});
mongoose.model('User', UserSchema);