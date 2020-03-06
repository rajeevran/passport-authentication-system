var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var aboutusSchema = new Schema({
    description: { type: String}
},{
    timestamps: true
});

module.exports = mongoose.model('Aboutus', aboutusSchema);