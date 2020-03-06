var mongoose = require("mongoose");
//Create SpecializationSchema
var categorySchema = new mongoose.Schema({
    name: { type: String},
    description: { type: String}
},{
    timestamps: true
});


// Export your module
module.exports = mongoose.model("Category", categorySchema);
