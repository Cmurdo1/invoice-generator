import React from 'react';
import { CogIcon, UserIcon, LockClosedIcon, GlobeAltIcon, CalendarIcon, LanguageIcon } from '@heroicons/react/24/outline';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 pt-16">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Settings</h1>
        <p className="text-lg font-medium text-gray-700">Configure all your application settings and preferences in one place</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">Profile Information</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2" defaultValue="John Doe" />
                </div>
              </div>
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 text-gray-500 mr-3" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full border border-gray-300 rounded-md px-3 py-2" defaultValue="john@example.com" />
                </div>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">Account Security</h4>
            <div className="flex items-center">
              <LockClosedIcon className="w-5 h-5 text-gray-500 mr-3" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Change Password</label>
                <button className="text-sm text-blue-600 hover:text-blue-800">Update Password</button>
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Dark Mode</h4>
                <p className="text-sm text-gray-600">Toggle between light and dark theme</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className="sr-only">Enable dark mode</span>
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive email alerts for invoices</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600">
                <span className="sr-only">Enable notifications</span>
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Default Currency</h4>
                <p className="text-sm text-gray-600">Set your preferred currency</p>
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>CAD</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Timezone</h4>
                <p className="text-sm text-gray-600">Set your local timezone</p>
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                <option>America/Los_Angeles</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Date Format</h4>
                <p className="text-sm text-gray-600">Set your preferred date format</p>
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Language</h4>
                <p className="text-sm text-gray-600">Set your preferred language</p>
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
