/**
 * PasswordList Component
 * 
 * Display list of credentials with keyboard navigation
 */

import { useEffect, useRef } from 'react';
import type { DecryptedCredential } from '../store/vaultStore';
import { CredentialItem } from './CredentialItem';

interface PasswordListProps {
  credentials: DecryptedCredential[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCopyPassword: (credential: DecryptedCredential) => void;
  onCopyUsername: (credential: DecryptedCredential) => void;
  searchQuery: string;
}

export function PasswordList({
  credentials,
  selectedId,
  onSelect,
  onCopyPassword,
  onCopyUsername,
  searchQuery,
}: PasswordListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (credentials.length === 0) return;

      const currentIndex = selectedId
        ? credentials.findIndex((c) => c.id === selectedId)
        : -1;

      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          newIndex = Math.min(currentIndex + 1, credentials.length - 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = credentials.length - 1;
          break;
        default:
          return;
      }

      if (newIndex !== currentIndex && newIndex >= 0) {
        onSelect(credentials[newIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [credentials, selectedId, onSelect]);

  // Auto-select first credential when search results change
  useEffect(() => {
    if (credentials.length > 0 && !selectedId) {
      onSelect(credentials[0].id);
    }
  }, [credentials, selectedId, onSelect]);

  if (credentials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg
          className="w-16 h-16 mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <p className="text-lg font-medium">
          {searchQuery ? 'No credentials found' : 'No credentials yet'}
        </p>
        <p className="text-sm mt-1">
          {searchQuery
            ? 'Try a different search term'
            : 'Add your first credential to get started'}
        </p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="space-y-2 overflow-y-auto max-h-[500px] pr-2">
      {credentials.map((credential) => (
        <CredentialItem
          key={credential.id}
          credential={credential}
          isSelected={credential.id === selectedId}
          onClick={() => {
            onSelect(credential.id);
          }}
          onCopyPassword={() => {
            onCopyPassword(credential);
          }}
          onCopyUsername={() => {
            onCopyUsername(credential);
          }}
        />
      ))}
    </div>
  );
}
