import React, { useEffect, useState } from 'react';

function AdminDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    fetch('http://localhost:5001/api/auth/all-users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">All Users</h2>
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u._id} className="border p-2 rounded">
            {u.name} - {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
