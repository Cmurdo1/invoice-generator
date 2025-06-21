import React from 'react';
import { useParams } from 'react-router-dom';

const ClientViewPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Client Details</h1>
        <p className="text-gray-600 mt-1">Client ID: {id}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Client Details View</h3>
          <p className="text-gray-600">Detailed client information and invoice history will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default ClientViewPage;
