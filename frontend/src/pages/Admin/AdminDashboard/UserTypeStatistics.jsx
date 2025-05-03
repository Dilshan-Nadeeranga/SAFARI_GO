import React from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const UserTypeStatistics = ({ regularUsers, premiumUsers }) => {
  // Calculate total and percentages
  const totalUsers = regularUsers + premiumUsers;
  const premiumPercentage = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0;
  const regularPercentage = totalUsers > 0 ? ((regularUsers / totalUsers) * 100).toFixed(1) : 0;
  
  // Prepare data for pie chart
  const data = [
    { name: 'Regular Users', value: regularUsers },
    { name: 'Premium Users', value: premiumUsers },
  ];
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#FFBB28'];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">User Type Distribution</h2>
        <Link 
          to="/admin/users"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          View All Users
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-500 mb-1">Total Users</p>
              <p className="text-xl font-bold">{totalUsers}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-500 mb-1">Regular Users</p>
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold">{regularUsers}</p>
                <span className="text-sm text-gray-500">{regularPercentage}%</span>
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-600 mb-1">Premium Users</p>
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold">{premiumUsers}</p>
                <span className="text-sm text-gray-500">{premiumPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserTypeStatistics;
