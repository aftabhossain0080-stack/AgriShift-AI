import { type ReactNode } from "react";

interface PageShellProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

/**
 * PageShell provides the main content wrapper for a page.
 * Nav and Footer are injected by the [locale]/layout.tsx root layout.
 * Use this component to wrap page-level content with consistent spacing.
 */
export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <main id="main-content" className="flex-1 w-full bg-offWhite">
      {(title || description) && (
        <div className="w-full border-b border-border bg-offWhite py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {title && (
              <h1 className="font-heading text-3xl font-semibold text-ink md:text-4xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-3 text-base text-soilBrown max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>
      )}
      {children}
    </main>
  );
}
