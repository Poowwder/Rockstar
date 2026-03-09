const mongoose = require('mongoose');
const actionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    action: { type: String, required: true },
    count: { type: Number, default: 0 }
});
module.exports = mongoose.model('Actions', actionSchema);