'use client';

import { useState } from 'react';

type CopyButtonProps = {
  value: string;
  label: string;
};

export function CopyButton({ value, label }: CopyButtonProps) {
  const [status, setStatus] = useState('');

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('Copied.');
    } catch {
      setStatus('Copy failed.');
    }
  }

  return (
    <>
      <button type="button" onClick={() => void copy()}>{label}</button>
      <p role="status" aria-live="polite">{status}</p>
    </>
  );
}
