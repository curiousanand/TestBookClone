'use client';

import { useEffect } from 'react';
import { FullPageError } from '@/components/ui/ErrorDisplay';
import { logger } from '@/lib/logger';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error
    logger.error('Next.js Error Page triggered', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      },
      context: {
        component: 'ErrorPage',
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
    });
  }, [error]);

  return (
    <FullPageError
      error={error}
      onRetry={reset}
      showDetails={process.env.NODE_ENV === 'development'}
    />
  );
}