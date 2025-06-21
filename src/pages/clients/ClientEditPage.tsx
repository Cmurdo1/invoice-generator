import React from 'react';
import { useParams } from 'react-router-dom';

const ClientEditPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Client</h1>
        <p className="text-gray-600 mt-1">Client ID: {id}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Edit Client Form</h3>
          <p className="text-gray-600">This feature will be similar to the create form but pre-filled with existing data.</p>
        </div>
      </div>
    </div>
  );
};

export default ClientEditPage;
