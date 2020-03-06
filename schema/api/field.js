var mongoose = require("mongoose");
//Create FieldSchema
var fieldSchema = new mongoose.Schema({
    name: { type: String},
    description: { type: String}
},{
    timestamps: true
});


// Export your module
module.exports = mongoose.model("Field", fieldSchema);
