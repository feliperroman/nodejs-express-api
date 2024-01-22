const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const usersSchema = mongoose.Schema({
    first_name           : String,
    last_name            : String,
    user_name            : String,
    type_user            : String,
    email                : String,
    password             : String,
    age                  : String,
    status               : String,
    birth                : String,
    phone                : String,
    city                 : String,
    country              : String,
    deleted              : {type: Boolean, default: false},
    resetPasswordToken   : String,
    resetPasswordExpires : Date,
    createdAt      : {
        type: Date,
        default: Date.now
    },
    
});
/**
 * @param {String} password 
 * @returns generating a hash
 */
usersSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
/**
 * @param {String} password 
 * @returns checking if password is valid
 */
usersSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('Users', usersSchema);
