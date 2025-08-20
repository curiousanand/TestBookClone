'use client';

import { FullPageError } from '@/components/ui/ErrorDisplay';
import { createNotFoundError } from '@/lib/errors';

export default function NotFound() {
  const error = createNotFoundError('Page');

  return (
    <FullPageError
      error={error}
      onGoHome={() => window.location.href = '/'}
    />
  );
}