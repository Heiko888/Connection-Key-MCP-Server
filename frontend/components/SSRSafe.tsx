import React, { ReactNode } from 'react';
import { useClientOnly } from '@/lib/hooks/useSSRSafe';

interface SSRSafeProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * SSR-sichere Komponente, die nur auf dem Client rendert
 * Verhindert Hydration-Mismatch für Client-spezifische Inhalte
 */
export function SSRSafe({ children, fallback = null }: SSRSafeProps) {
  const isClient = useClientOnly();
  
  if (!isClient) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * SSR-sichere Komponente für externe Links
 * Verhindert window.open Hydration-Probleme
 */
interface SSRSafeExternalLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SSRSafeExternalLink({ 
  href, 
  children, 
  className,
  onClick 
}: SSRSafeExternalLinkProps) {
  const isClient = useClientOnly();
  
  const handleClick = () => {
    if (isClient && window) {
      window.open(href, '_blank');
    }
    onClick?.();
  };
  
  return (
    <span 
      className={className}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </span>
  );
}

/**
 * SSR-sichere Komponente für Datum-Anzeige
 * Verwendet konsistente Zeitzone für Server und Client
 */
interface SSRSafeDateProps {
  date?: Date;
  format?: 'date' | 'datetime' | 'time';
  children?: (formattedDate: string) => ReactNode;
}

export function SSRSafeDate({ 
  date = new Date(), 
  format = 'date',
  children 
}: SSRSafeDateProps) {
  const [formattedDate, setFormattedDate] = React.useState('');
  
  React.useEffect(() => {
    const formatDate = (d: Date) => {
      switch (format) {
        case 'date':
          return d.toISOString().split('T')[0];
        case 'datetime':
          return d.toISOString();
        case 'time':
          return d.toTimeString();
        default:
          return d.toISOString().split('T')[0];
      }
    };
    
    setFormattedDate(formatDate(date));
  }, [date, format]);
  
  if (children) {
    return <>{children(formattedDate)}</>;
  }
  
  return <span>{formattedDate}</span>;
}
