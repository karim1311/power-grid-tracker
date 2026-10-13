'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
    >
      {pending ? 'Deleting...' : 'Delete'}
    </button>
  );
}

export function DeleteOutageButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Delete this outage? This cannot be undone.')) e.preventDefault();
      }}
    >
      <SubmitButton />
    </form>
  );
}