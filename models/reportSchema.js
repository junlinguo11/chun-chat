const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ReportSchema = new Schema({
    content: {
        type: String
    },
    time: {
        type: Date,
        default: Date.now
    }
});

ReportSchema.methods.saveReport = function() {
    return this.save();
}

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;