const Lead = require('../models/Lead');
const { Parser } = require('json2csv');

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

const updateLead = async(req, res) => {
    try {
        const { id } = req.params;
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

        // Find the lead
        const lead = await Lead.findById(id);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        // Update the lead
        const updatedLead = await Lead.findByIdAndUpdate(
            id,
            {
                name,
                email,
                phone,
                source,
                status,
                tags,
                notes,
                assignedTo,
            },
            { new: true, runValidators: true }
        );

        res.json({ 
            message: "Lead updated successfully", 
            lead: updatedLead 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
}

const deleteLead = async(req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the lead
        const lead = await Lead.findByIdAndDelete(id);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        res.json({ message: "Lead deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
}

const getMyLeads = async(req, res) => {
    try {
        // Find all leads assigned to the current user
        const leads = await Lead.find({ assignedTo: req.userId })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json(leads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
}

const exportLeads = async(req, res) => {
    try {
        const { status } = req.query;
        const userRole = req.user.role;

        // Build query based on filters
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        // If user is a support agent, only show their leads
        if (userRole === 'support-agent') {
            query.assignedTo = req.userId;
        }

        // Fetch leads with populated assignedTo field
        const leads = await Lead.find(query)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        // Define CSV fields
        const fields = [
            { label: 'Name', value: 'name' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Source', value: 'source' },
            { label: 'Status', value: 'status' },
            { label: 'Assigned To', value: row => row.assignedTo ? row.assignedTo.name : 'Unassigned' },
            { label: 'Created At', value: row => new Date(row.createdAt).toLocaleDateString() }
        ];

        const parser = new Parser({ fields });
        const csv = parser.parse(leads);

        // Set headers for CSV download
        res.header('Content-Type', 'text/csv');
        res.attachment('leads_export.csv');
        return res.send(csv);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ 
            message: "Error exporting leads", 
            error: error.message 
        });
    }
}

module.exports = {
    addLead,
    updateLead,
    deleteLead,
    getMyLeads,
    exportLeads
}