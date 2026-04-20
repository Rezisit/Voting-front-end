import React from 'react';

const MakeAdminButton = ({ userId, token, refreshUsers }) => {
  const makeAdmin = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/set-admin/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      alert(data.message);
      refreshUsers(); // optional: refresh user list
    } catch (err) {
      console.error(err);
    }
  };

  return <button onClick={makeAdmin}>Make Admin</button>;
};

export default MakeAdminButton;
