import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ViewLeads from './ViewLeads';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editLead, setEditLead] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [agents, setAgents] = useState([]);

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError('');
      const endpoint = userRole === 'support-agent' ? '/api/leads/mine' : '/api/leads';
      const res = await axios.get(`http://localhost:5000${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to fetch leads. Please try again later.');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users?role=support-agent', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgents(res.data.users || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const handleExport = async () => {
    try {
      setError('');
      const res = await axios.get(`http://localhost:5000/api/leads/export?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting leads:', err);
      setError('Failed to export leads. Please try again.');
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchAgents();
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

  const handleDelete = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      setError('');
      await axios.delete(`http://localhost:5000/api/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }}
      );
      fetchLeads();
    } catch (err) {
      console.error('Error deleting lead:', err);
      setError('Failed to delete lead. Please try again.');
    }
  };

  const handleEdit = (lead) => {
    setEditLead(lead);
    setEditForm({
      ...lead,
      tags: lead.tags?.join(', ') || '',
      notes: lead.notes?.join('\n') || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const updatedData = {
        ...editForm,
        tags: editForm.tags.split(',').map(tag => tag.trim()),
        notes: editForm.notes.split('\n').filter(note => note.trim())
      };

      await axios.put(`http://localhost:5000/api/leads/${editLead._id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditLead(null);
      fetchLeads();
    } catch (err) {
      console.error('Error updating lead:', err);
      setError('Failed to update lead. Please try again.');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter;
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase());
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
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Assigned To</th>
                  <th className="px-4 py-2 text-left">Created At</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-2 text-center text-gray-500">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr 
                      key={lead._id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{lead.name}</td>
                      <td className="px-4 py-2">{lead.email}</td>
                      <td className="px-4 py-2">{lead.phone}</td>
                      <td className="px-4 py-2">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          {["New", "Contacted", "Qualified", "Lost", "Won"].map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">{lead.assignedTo?.name || 'Unassigned'}</td>
                      <td className="px-4 py-2">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(lead)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(lead._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
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
          <div className="bg-white rounded-lg shadow">
            <ViewLeads
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onUpdate={fetchLeads}
            />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Lead</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Source</label>
                <input
                  type="text"
                  value={editForm.source}
                  onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                >
                  {["New", "Contacted", "Qualified", "Lost", "Won"].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (one per line)</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assign To</label>
                <select
                  value={editForm.assignedTo}
                  onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                >
                  <option value="">Select Agent</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditLead(null)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagement; 