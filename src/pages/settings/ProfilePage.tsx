import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information and company details</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <UserCircleIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Management</h3>
          <p className="text-gray-600">User profile and company information will be available here.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
