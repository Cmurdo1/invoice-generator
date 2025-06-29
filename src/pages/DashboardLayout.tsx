import React, { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  Bars3Icon, // Hamburger icon
  XMarkIcon // Close icon
} from '@heroicons/react/24/outline';
import './DashboardLayout.css'; // Import the CSS file

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Toggle Button (Hamburger/Close Icon) */}
      <button
        className="sidebar-toggle-button fixed top-4 left-4 z-[1001] p-2 rounded-md text-gray-700 bg-white shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isSidebarOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="p-4">
          <Link to="/" className="text-2xl font-bold text-white block mb-8">Your App</Link> {/* Replace with your app logo/name */}
          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-2 text-white hover:bg-gray-700 rounded-md transition-colors"
              onClick={closeSidebar}
            >
              <HomeIcon className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            <Link
              to="/invoices"
              className="flex items-center px-4 py-2 text-white hover:bg-gray-700 rounded-md transition-colors"
              onClick={closeSidebar}
            >
              <DocumentTextIcon className="h-5 w-5 mr-3" />
              Invoices
            </Link>
            <Link
              to="/clients"
              className="flex items-center px-4 py-2 text-white hover:bg-gray-700 rounded-md transition-colors"
              onClick={closeSidebar}
            >
              <UserGroupIcon className="h-5 w-5 mr-3" />
              Clients
            </Link>
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-white hover:bg-gray-700 rounded-md transition-colors"
              onClick={closeSidebar}
            >
              <Cog6ToothIcon className="h-5 w-5 mr-3" />
              Settings
            </Link>
            {/* Add more navigation links here */}
          </nav>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-[999]"
          onClick={closeSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Main Content Area */}
      <main className={`main-content ${isSidebarOpen ? 'main-content-shifted' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
