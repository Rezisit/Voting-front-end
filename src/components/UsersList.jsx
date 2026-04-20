import React, { useEffect, useState } from 'react';
import MakeAdminButton from '.MakeAdminButton';

const UsersList = ({ token }) => {
  const [users, setUsers] = useState([]);

  // Fetch all users from backend
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>All Users</h2>
      {users.map((user) => (
        <div key={user._id} style={{ marginBottom: '10px' }}>
          {user.username} ({user.role})
          {user.role !== 'admin' && (
            <MakeAdminButton userId={user._id} token={token} refreshUsers={fetchUsers} />
          )}
        </div>
      ))}
    </div>
  );
};

export default UsersList;
