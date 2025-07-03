import React, { useState, useEffect } from 'react';
import { 
  Home, 
  TrendingUp, 
  Target, 
  FileText, 
  Clock, 
  Settings, 
  X,
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ activePage, onPageChange, isOpen, onToggle }) => {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const savedImage = localStorage.getItem('dirhaminc_profile_image');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'accounts', label: 'My Accounts', icon: Building2 },
    { id: 'transactions', label: 'Transactions', icon: TrendingUp },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'forecasting', label: 'Forecasting', icon: Clock },
    { id: 'notes', label: 'Money Notes', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={
        `fixed top-0 left-0 h-screen bg-[#012D37] shadow-lg z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto
        ${collapsed ? 'w-20' : 'w-64'}
        `
      }>
        <div className="flex flex-col h-screen">
          {/* Header: Toggle and Logo */}
          <div className="relative flex items-center justify-center p-6 border-b border-white border-opacity-10">
            <button
              onClick={() => setCollapsed(c => !c)}
              className="p-2 rounded hover:bg-white hover:bg-opacity-10 transition-colors absolute left-6 top-1/2 -translate-y-1/2"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-5 h-5 text-white" /> : <ChevronLeft className="w-5 h-5 text-white" />}
            </button>
            {!collapsed && (
              <h1 className="text-3xl text-white font-bebas-neue tracking-wide text-center w-full">DirhamInc</h1>
            )}
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded hover:bg-white hover:bg-opacity-10 absolute right-6 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 flex flex-col">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded text-left transition-colors duration-200
                      ${collapsed ? 'justify-center' : 'space-x-3'}
                      ${activePage === item.id 
                        ? 'bg-white text-[#012D37] font-bold' 
                        : 'text-white hover:bg-white hover:bg-opacity-10'}
                    `}
                  >
                    <span className="flex items-center justify-center w-5 h-5">
                      <Icon className="w-5 h-5" />
                    </span>
                    {!collapsed && (
                      <span className="font-medium ml-3">{item.label}</span>
                    )}
                  </button>
                  {collapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity bg-gray-900 text-white text-xs rounded px-3 py-1 whitespace-nowrap shadow-lg">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Profile Section at Bottom */}
          <div className={`p-4 border-t border-white border-opacity-10 flex items-center min-h-[72px] mt-auto ${collapsed ? 'justify-center' : 'justify-start'}`}>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden ${collapsed ? '' : 'ml-1'}">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#012D37] font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-300">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 