const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    phone:{
        type: String,
        required: true,
        unique: true
    },
    source:{
        type: String,
    },
    status:{
        type: String,
        enum: ['new', 'contacted', 'qualified', 'lost', 'won'],
        default: 'new'
    },
    tags:{
        type: [String],
        default: []
    },
    notes:{
        type: [String],
        default: []
    },
    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },  
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);

