'use client';

import { useEffect } from 'react';
import { FullPageError } from '@/components/ui/ErrorDisplay';
import { logger } from '@/lib/logger';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the critical error
    logger.fatal('Global Error Handler triggered', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      },
      context: {
        component: 'GlobalError',
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        critical: true,
      },
    });
  }, [error]);

  return (
    <html>
      <body>
        <FullPageError
          error={{
            code: 'CRITICAL_ERROR',
            message: error.message,
            userMessage: 'A critical error occurred. Please refresh the page or contact support if the problem persists.',
            statusCode: 500,
            severity: 'critical',
            category: 'server',
            timestamp: new Date().toISOString(),
          }}
          onRetry={reset}
          onGoHome={() => window.location.href = '/'}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </body>
    </html>
  );
}