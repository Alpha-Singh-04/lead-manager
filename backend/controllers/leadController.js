const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const { Parser } = require('json2csv');
const ExcelJS = require("exceljs");
const User = require('../models/User'); // Import User model to populate assignedTo

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

const getAllLeads = async (req, res) => {
    try {
        // Superadmin and Subadmin can view all leads
        const leads = await Lead.find()
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json(leads);
    } catch (error) {
        console.error('Error fetching all leads:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

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
        console.log('Debug: req.userId in getMyLeads:', req.userId);
        // Find all leads assigned to the current user
        const leads = await Lead.find({ assignedTo: new mongoose.Types.ObjectId(req.userId) })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        console.log('Debug: Leads found:', leads.length);

        res.json(leads);
    } catch (error) {
        console.error('Error fetching leads for user ID', req.userId, ':', error);
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
        if (userRole === 'agent') {
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

const importLeads = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        const worksheet = workbook.worksheets[0];

        const rows = [];
        worksheet.eachRow((row, rowNumber) => {
          rows.push(row.values.slice(1)); // remove empty 1st column
    });

    const columns = rows.length > 0 ? rows[0] : [];
    const dataRows = rows.slice(1); // exclude header

    res.json({
        columns,
        rows: dataRows,
    });
    } catch (error) {
        console.error("ExcelJS parsing error:", error);
        res.status(500).json({ message: "Failed to parse Excel file." });
    }
};

const getDashboardStats = async(req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.userId;

        // Base query - if support agent, only show their leads
        const baseQuery = userRole === 'agent' ? { assignedTo: userId } : {};

        // Get total leads count
        const totalLeads = await Lead.countDocuments(baseQuery);

        // Get leads by status
        const statusCounts = await Lead.aggregate([
            { $match: baseQuery },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get agent performance
        const agentPerformance = await Lead.aggregate([
            { $match: baseQuery },
            { $group: {
                _id: '$assignedTo',
                totalLeads: { $sum: 1 },
                wonLeads: {
                    $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] }
                },
                newLeads: {
                    $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
                }
            }},
            { $sort: { totalLeads: -1 } }
        ]);

        // Populate agent performance with user details
        await User.populate(agentPerformance, { path: '_id', select: 'name email' });

        // Get recent leads (last 5)
        const recentLeads = await Lead.find(baseQuery)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        // Calculate conversion rate
        const wonCount = statusCounts.find(s => s._id === 'won')?.count || 0;
        const conversionRate = totalLeads > 0 
            ? (wonCount / totalLeads) * 100 
            : 0;

        res.json({
            totalLeads,
            statusCounts,
            agentPerformance,
            recentLeads,
            conversionRate: conversionRate.toFixed(1)
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ 
            message: "Error fetching dashboard stats", 
            error: error.message 
        });
    }
}

module.exports = {
    addLead,
    getAllLeads,
    updateLead,
    deleteLead,
    getMyLeads,
    exportLeads,
    importLeads,
    getDashboardStats
};