import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedUser, setEditedUser] = useState({ email: '', role: 'agent' });

  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5000/api/users/all', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const startEdit = (user) => {
    setEditingId(user._id);
    setEditedUser({ email: user.email, role: user.role });
  };

  const handleEditChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    await axios.put(`http://localhost:5000/api/users/${id}`, editedUser, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEditingId(null);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await axios.delete(`http://localhost:5000/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Role</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border px-2 py-1">
                {editingId === user._id ? (
                  <input
                    type="text"
                    name="email"
                    value={editedUser.email}
                    onChange={handleEditChange}
                    className="border px-1"
                  />
                ) : (
                  user.email
                )}
              </td>
              <td className="border px-2 py-1">
                {editingId === user._id ? (
                  <select
                    name="role"
                    value={editedUser.role}
                    onChange={handleEditChange}
                    className="border px-1"
                  >
                    <option value="subadmin">Sub-Admin</option>
                    <option value="agent">Support Agent</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td className="border px-2 py-1">
                {editingId === user._id ? (
                  <>
                    <button onClick={() => saveEdit(user._id)} className="text-green-600">Save</button>
                    <button onClick={() => setEditingId(null)} className="ml-2 text-gray-600">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(user)} className="text-blue-600">Edit</button>
                    <button onClick={() => deleteUser(user._id)} className="ml-2 text-red-600">Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;