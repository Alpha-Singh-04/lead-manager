import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('http://localhost:5000/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ensure we're setting an array, even if the response is empty
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to fetch leads. Please try again later.');
      setLeads([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      setError('');
      await axios.put(`http://localhost:5000/api/leads/${leadId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchLeads();
    } catch (err) {
      console.error('Error updating lead status:', err);
      setError('Failed to update lead status. Please try again.');
    }
  };

  const addNote = async (leadId) => {
    if (!newNote.trim()) return;
    
    try {
      setError('');
      await axios.post(`http://localhost:5000/api/leads/${leadId}/notes`,
        { note: newNote },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setNewNote('');
      fetchLeads();
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note. Please try again.');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter;
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Lead Management</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-1 rounded"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="all">All Leads</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
            <option value="Won">Won</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leads List */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr 
                      key={lead._id}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-4 py-2">{lead.name}</td>
                      <td className="px-4 py-2">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                          className="border rounded px-2 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {["New", "Contacted", "Qualified", "Lost", "Won"].map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Details */}
        {selectedLead && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Lead Details</h3>
            <div className="space-y-3">
              <p><strong>Name:</strong> {selectedLead.name}</p>
              <p><strong>Email:</strong> {selectedLead.email}</p>
              <p><strong>Phone:</strong> {selectedLead.phone}</p>
              <p><strong>Source:</strong> {selectedLead.source}</p>
              <p><strong>Status:</strong> {selectedLead.status}</p>
              <p><strong>Tags:</strong> {selectedLead.tags?.join(', ') || 'No tags'}</p>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Notes</h4>
                <div className="space-y-2 mb-4">
                  {selectedLead.notes?.map((note, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      {note}
                    </div>
                  )) || <p className="text-gray-500">No notes yet</p>}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 border rounded px-2 py-1"
                  />
                  <button
                    onClick={() => addNote(selectedLead._id)}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadManagement; 