import React from 'react';

const Members: React.FC = () => {
  const membersData = [
    {
      id: 'ID: 001',
      name: 'Alice Johnson',
      contact: '555-0101',
      email: 'alice@email.com',
      membershipDates: {
        joined: 'Joined: 2019-07-20'
      },
      investedCapital: '$10,000.00',
      equityValue: '$10,272.00',
      shares: '40.00%',
      status: 'Active',
      profile: 'FLG_Dynamique'
    },
    {
      id: 'ID: 002',
      name: 'Bob Williams',
      contact: '555-0102',
      email: 'bob@email.com',
      membershipDates: {
        joined: 'Joined: 2019-07-20'
      },
      investedCapital: '$15,000.00',
      equityValue: '$15,408.00',
      shares: '60.00%',
      status: 'Active',
      profile: 'PHR_Prudent'
    },
    {
      id: 'ID: 003',
      name: 'Charlie Brown',
      contact: '555-0103',
      email: 'charlie@email.com',
      membershipDates: {
        joined: 'Joined: 2022-06-01',
        exited: 'Exited: 2023-12-31'
      },
      investedCapital: '$5,000.00',
      equityValue: '$0.00',
      shares: '0.00%',
      status: 'Inactive',
      profile: 'FLG_Dynamique'
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-300 mb-6">Club Members</h2>
      
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">NAME / ID</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">CONTACT</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">EMAIL</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">MEMBERSHIP DATES</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">INVESTED CAPITAL</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">EQUITY VALUE / SHARES (%)</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">STATUS</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">PROFILE</th>
              </tr>
            </thead>
            <tbody>
              {membersData.map((member, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <td className="p-4">
                    <div>
                      <div className="text-blue-400 font-medium">{member.name}</div>
                      <div className="text-gray-500 text-sm">{member.id}</div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{member.contact}</td>
                  <td className="p-4">
                    <a href={`mailto:${member.email}`} className="text-blue-400 hover:text-blue-300">
                      {member.email}
                    </a>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-300 text-sm">
                      <div>{member.membershipDates.joined}</div>
                      {member.membershipDates.exited && (
                        <div className="text-gray-500">{member.membershipDates.exited}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{member.investedCapital}</td>
                  <td className="p-4">
                    <div>
                      <div className="text-gray-300">{member.equityValue}</div>
                      <div className="text-gray-500 text-sm">{member.shares}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      member.status === 'Active' 
                        ? 'bg-green-900/30 text-green-400 border border-green-700' 
                        : 'bg-gray-900/30 text-gray-400 border border-gray-700'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{member.profile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Members;