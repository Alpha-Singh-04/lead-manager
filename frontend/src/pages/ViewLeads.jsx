import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ViewLeads () {
  const [leads, setLeads] = useState([]);
  const [role, setRole] = useState("");
  const [editLead, setEditLead] = useState(null); // lead object to edit
  const [form, setForm] = useState({}); // form state inside modal

  const token = localStorage.getItem("token");

  const fetchLeads = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userRole = storedUser?.role;
    setRole(userRole);

    const endpoint = userRole === "support-agent" ? "/api/leads/mine" : "/api/leads";

    try {
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(res.data.leads);
    } catch (err) {
      console.error("Error fetching leads", err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await axios.delete(`/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Lead deleted");
      fetchLeads();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleEdit = (lead) => {
    setEditLead(lead);
    setForm({ ...lead, tags: lead.tags?.join(", ") || "", notes: lead.notes?.join("\n") || "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updated = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()),
      notes: form.notes.split("\n"),
    };
    try {
      await axios.put(`/api/leads/${editLead._id}`, updated, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Lead updated");
      setEditLead(null);
      fetchLeads();
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4 font-semibold">Leads</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-200">
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Assigned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id} className="border-t">
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.status}</td>
              <td>{lead.assignedTo?.email || "Unassigned"}</td>
              <td>
                <button className="text-blue-500 mr-2" onClick={() => handleEdit(lead)}>Edit</button>
                <button className="text-red-500" onClick={() => handleDelete(lead._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✏️ Modal for Edit */}
      {editLead && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center z-10">
          <form onSubmit={handleUpdate} className="bg-white p-6 rounded shadow-lg w-[400px] space-y-3">
            <h3 className="text-lg font-semibold">Edit Lead</h3>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border p-1" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border p-1" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border p-1">
              {["New", "Contacted", "Qualified", "Lost", "Won"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma-separated)" className="w-full border p-1" />
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (line-separated)" className="w-full border p-1" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded">Update</button>
              <button type="button" className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => setEditLead(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

