const Lead = require('../models/Lead');

const addLead = async(req, res) => {
    try{
        const {
        name,
        email,
        phone,
        source,
        status,
        tags,
        notes,
        assignedTo,
        } = req.body;

        const newLead = new Lead({
            name,
            email,
            phone,
            source,
            status,
            tags,
            notes,
            assignedTo,
            createdBy: req.userId,
        });
            
        await newLead.save();
        res.status(201).json({ 
            message: "Lead created successfully", 
            lead: newLead 
        });
    }catch(error){
        console.error(error);
        res.status(500).json({ 
            message: "Server error", error: error.message 
        });
    }
}

module.exports = {
    addLead,
}