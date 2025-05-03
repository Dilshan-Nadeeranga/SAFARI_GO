import React from 'react';
import '../Componet/CSS/Table.scss';

const Table = ({ data }) => {
  return (
    <table className="dashboard-table">
      <thead>
        <tr>
          <th>User ID</th>
          <th>Email</th>
          <th>Role</th>
          {/* Status column removed */}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data && data.map((user, index) => (
          <tr key={user._id || index}>
            <td>{user._id ? user._id.substring(0, 8) : 'N/A'}</td>
            <td>{user.email || 'N/A'}</td>
            <td>
              <span className={`user-role ${user.role}`}>
                {user.role || 'N/A'}
              </span>
            </td>
            {/* Status column removed */}
            <td>
              <div className="action-buttons">
                <button className="view-btn">View</button>
                <button className="edit-btn">Edit</button>
              </div>
            </td>
          </tr>
        ))}
        {(!data || data.length === 0) && (
          <tr>
            <td colSpan="4" className="text-center">No users found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Table;
