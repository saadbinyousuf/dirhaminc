import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Camera, X, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, uploadProfilePhoto, exportData } from '../../services/api';
import SUPPORTED_CURRENCIES from '../../utils/supportedCurrencies';

const Settings = () => {
  const { user, logout, loading: authLoading, ProtectedRoute } = useAuth();
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [baseCurrency, setBaseCurrency] = useState('AED');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const fileInputRef = useRef(null);

  const settingsSections = [
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Budget Alerts', value: 'Enabled' },
        { label: 'Transaction Reminders', value: 'Enabled' },
        { label: 'Weekly Reports', value: 'Disabled' },
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        { label: 'Data Storage', value: 'Cloud' },
        { label: 'Auto Logout', value: '30 minutes' },
      ]
    }
  ];

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSubmitLoading(true);
      setSubmitError(null);
      try {
        const result = await uploadProfilePhoto(file);
        setProfileImage(result.profileImage);
      } catch (err) {
        setSubmitError(err?.error || 'Failed to upload image');
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  const removeProfileImage = async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      await updateProfile({ profileImage: null });
      setProfileImage(null);
    } catch (err) {
      setSubmitError(err?.error || 'Failed to remove image');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCurrencyChange = async (newCurrency) => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      await updateProfile({ baseCurrency: newCurrency });
      setBaseCurrency(newCurrency);
    } catch (err) {
      setSubmitError(err?.error || 'Failed to update currency');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleExportData = async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dirhaminc-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setSubmitError(err?.error || 'Failed to export data');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (authLoading) return <div className="p-6">Loading...</div>;

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-dm-sans">Settings</h1>
          <p className="text-gray-600">Manage your account preferences</p>
        </div>

        {/* Profile Section with Photo Upload */}
        <div className="bg-white rounded shadow-sm">
          <div className="p-6 border-b border-[#EFEFF2]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  {profileImage && (
                    <button
                      onClick={removeProfileImage}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      disabled={submitLoading}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors font-bold"
                    disabled={submitLoading}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-700">Name</span>
                  <span className="text-gray-900 font-medium">{user?.name || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-700">Email</span>
                  <span className="text-gray-900 font-medium">{user?.email || 'Not set'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Settings Sections */}
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-white rounded shadow-sm">
              <div className="p-6 border-b border-[#EFEFF2]">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2">
                      <span className="text-gray-700">{item.label}</span>
                      <span className="text-gray-900 font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Appearance Section with Currency Selector */}
        <div className="bg-white rounded shadow-sm">
          <div className="p-6 border-b border-[#EFEFF2] flex items-center space-x-3">
            <Palette className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">Theme</span>
              <span className="text-gray-900 font-medium">Light</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">Currency</span>
              <select
                value={baseCurrency}
                onChange={e => handleCurrencyChange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                disabled={submitLoading}
              >
                {SUPPORTED_CURRENCIES.map(cur => (
                  <option key={cur.code} value={cur.code}>{cur.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">Font</span>
              <span className="text-gray-900 font-medium">Raleway</span>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-gray-50 rounded p-6">
          <div className="flex items-center space-x-3 mb-4">
            <SettingsIcon className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">App Information</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Build:</strong> Development</p>
            <p><strong>Framework:</strong> React 18</p>
            <p><strong>Styling:</strong> Tailwind CSS</p>
            <p><strong>Icons:</strong> Lucide React</p>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded shadow-sm">
          <div className="p-6 border-b border-[#EFEFF2]">
            <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Export Data</h3>
                <p className="text-sm text-gray-600">Download your financial data as JSON</p>
              </div>
              <button 
                onClick={handleExportData}
                className="px-4 py-2 bg-primary text-white font-bold rounded hover:bg-primary-dark transition-colors duration-200"
                disabled={submitLoading}
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="bg-white rounded shadow-sm">
          <div className="p-6 border-b border-[#EFEFF2]">
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          </div>
          <div className="p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200 font-bold"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Settings; 