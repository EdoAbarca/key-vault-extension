/**
 * PopupContainer Component
 * 
 * Main popup interface container
 */

import { useState, useEffect } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { SearchBar } from './SearchBar';
import { PasswordList } from './PasswordList';
import { PasswordGenerator } from './PasswordGenerator';
import { Settings } from './Settings';

export function PopupContainer() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    isUnlocked,
    credentials,
    isLoading,
    error,
    searchQuery,
    selectedCredentialId,
    searchCredentials,
    selectCredential,
    copyToClipboard,
    getFilteredCredentials,
    updateActivity,
  } = useVaultStore();

  // Track user activity on mouse and keyboard events
  useEffect(() => {
    if (!isUnlocked) {
      return;
    }

    const handleActivity = () => {
      updateActivity();
    };

    // Add listeners for user activity
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isUnlocked, updateActivity]);

  const filteredCredentials = getFilteredCredentials();

  const handleCopyPassword = async (credential: { password: string }) => {
    try {
      await copyToClipboard(credential.password);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  const handleCopyUsername = async (credential: { username: string }) => {
    try {
      await copyToClipboard(credential.username);
    } catch (error) {
      console.error('Failed to copy username:', error);
    }
  };

  const handlePasswordGenerated = async (password: string) => {
    try {
      await copyToClipboard(password);
    } catch (error) {
      console.error('Failed to copy generated password:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading credentials...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-600">
          <svg
            className="w-12 h-12 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="font-medium mb-2">Error</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Show unlock prompt if vault is locked
  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vault Locked</h2>
          <p className="text-gray-600">Please unlock your vault to view credentials</p>
        </div>
      </div>
    );
  }

  // Show password generator if opened
  if (showGenerator) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <PasswordGenerator
          onClose={() => { setShowGenerator(false); }}
          onPasswordGenerated={(password) => { void handlePasswordGenerated(password); }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gray-900">Key Vault</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowSettings(true); }}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => { setShowGenerator(true); }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              title="Generate password"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>Generate</span>
            </button>
            <span className="text-sm text-gray-500">
              {credentials.length} {credentials.length === 1 ? 'credential' : 'credentials'}
            </span>
          </div>
        </div>
        <SearchBar value={searchQuery} onChange={searchCredentials} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-4 py-3">
        <PasswordList
          credentials={filteredCredentials}
          selectedId={selectedCredentialId}
          onSelect={selectCredential}
          onCopyPassword={(credential) => {
            void handleCopyPassword(credential);
          }}
          onCopyUsername={(credential) => {
            void handleCopyUsername(credential);
          }}
          searchQuery={searchQuery}
        />
      </div>

      {/* Footer */}
      {filteredCredentials.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Use ↑↓ to navigate • Enter to select • Click icons to copy
          </p>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Settings onClose={() => { setShowSettings(false); }} />
      )}
    </div>
  );
}
