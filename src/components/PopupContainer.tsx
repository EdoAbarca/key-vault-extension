/**
 * PopupContainer Component
 * 
 * Main popup interface container
 */

import { useVaultStore } from '../store/vaultStore';
import { SearchBar } from './SearchBar';
import { PasswordList } from './PasswordList';

export function PopupContainer() {
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
  } = useVaultStore();

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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gray-900">Key Vault</h1>
          <span className="text-sm text-gray-500">
            {credentials.length} {credentials.length === 1 ? 'credential' : 'credentials'}
          </span>
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
    </div>
  );
}
