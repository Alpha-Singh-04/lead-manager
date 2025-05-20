import React, { useState, useEffect } from "react";
import axios from "axios";

const AddLead = () => {
const [form, setForm] = useState({
name: "",
email: "",
phone: "",
source: "",
status: "New",
tags: "",
notes: "",
assignedTo: "",
});

const [agents, setAgents] = useState([]);

useEffect(() => {
    axios.get("/api/users?role=support-agent", {
    headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
    },
})
    .then((res) => setAgents(res.data.users))
    .catch((err) => console.log("Error fetching agents", err));
}, []);

const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
    ...form,
    tags: form.tags.split(",").map((t) => t.trim()),
    notes: form.notes ? [form.notes] : [],
    };

    try {
    await axios.post("/api/leads", body, {
        headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    alert("Lead created successfully");
    setForm({
        name: "",
        email: "",
        phone: "",
        source: "",
        status: "New",
        tags: "",
        notes: "",
        assignedTo: "",
    });
    } catch (err) {
    console.error("Error creating lead", err);
    alert("Error creating lead");
    }
};

return (
<div className="p-4">
<h2 className="text-xl mb-4 font-semibold">Add New Lead</h2>
<form onSubmit={handleSubmit} className="grid gap-3">
<input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
<input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
<input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
<input placeholder="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
{["New", "Contacted", "Qualified", "Lost", "Won"].map((status) => (
<option key={status}>{status}</option>
))}
</select>
<input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
<textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
<select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
<option value="">Assign to Agent</option>
{agents.map((a) => (
<option value={a._id} key={a._id}>{a.email}</option>
))}
</select>
<button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create Lead</button>
</form>
</div>
);
};

export default AddLead;