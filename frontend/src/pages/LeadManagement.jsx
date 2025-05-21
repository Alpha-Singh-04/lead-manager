import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ViewLeads from './ViewLeads';

const LeadManagement = ({ currentUserRole }) => {
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

  const fetchLeads = async () => {
    const endpoint = currentUserRole === 'agent' ? '/api/leads/mine' : '/api/leads';

    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`http://localhost:5000${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to fetch leads. Please try again later.');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users?role=agent', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgents(res.data || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const handleExport = async () => {
    try {
      setError('');
      const exportEndpoint = currentUserRole === 'agent' ? `/api/leads/export?status=${filter}&assignedToMine=true` : `/api/leads/export?status=${filter}`;
      
      const res = await axios.get(`http://localhost:5000${exportEndpoint}`, {
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
    if (currentUserRole) {
        fetchLeads();
        if (currentUserRole === 'superadmin' || currentUserRole === 'subadmin') {
            fetchAgents();
        }
    }
  }, [currentUserRole]);

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      setError('');
      await axios.put(`http://localhost:5000/api/leads/${leadId}`, 
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
      assignedTo: lead.assignedTo?._id || '',
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
    const matchesFilter = filter === 'all' || lead.status?.toLowerCase() === filter.toLowerCase();
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = 
      lead.name?.toLowerCase().includes(lowerSearchTerm) ||
      lead.email?.toLowerCase().includes(lowerSearchTerm) ||
      lead.phone?.toLowerCase().includes(lowerSearchTerm) ||
      lead.source?.toLowerCase().includes(lowerSearchTerm) ||
      lead.tags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm)) ||
      lead.notes?.some(note => note.toLowerCase().includes(lowerSearchTerm)) ||
      lead.assignedTo?.name?.toLowerCase().includes(lowerSearchTerm) ||
      lead.assignedTo?.email?.toLowerCase().includes(lowerSearchTerm) ||
      (lead.createdAt && new Date(lead.createdAt).toLocaleDateString().toLowerCase().includes(lowerSearchTerm));

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600">
        <p>Loading leads...</p>
      </div>
    );
  }

  const leadStatuses = ['new', 'contacted', 'qualified', 'lost', 'won'];

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Lead Management</h2>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full md:w-60"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full md:w-40"
          >
            <option value="all">All Leads</option>
            {leadStatuses.map((status) => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
          {(currentUserRole === 'superadmin' || currentUserRole === 'subadmin') && (
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 w-full md:w-auto"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">
                      No leads found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr 
                      key={lead._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{lead.email}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                          className="border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {leadStatuses.map((status) => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{lead.assignedTo?.name || 'Unassigned'}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          {(currentUserRole === 'superadmin' || currentUserRole === 'subadmin') && (
                            <>
                              <button
                                onClick={() => setSelectedLead(lead)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(lead)}
                                className="text-green-600 hover:text-green-900 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(lead._id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {currentUserRole === 'agent' && (
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              View
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

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

      {editLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Edit Lead</h3>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <input
                  type="text"
                  value={editForm.source}
                  onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {leadStatuses.map((status) => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (one per line)</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={editForm.assignedTo}
                  onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Agent</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditLead(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
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