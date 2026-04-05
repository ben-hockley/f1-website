import Link from 'next/link';
import { getFlagCodeFromNationality } from '@/lib/nationalityFlags';

interface DriverNameWithFlagProps {
  driverId?: string;
  givenName: string;
  familyName: string;
  nationality: string;
  className?: string;
  nameClassName?: string;
}

const DriverNameWithFlag: React.FC<DriverNameWithFlagProps> = ({
  driverId,
  givenName,
  familyName,
  nationality,
  className,
  nameClassName,
}) => {
  const flagCode = getFlagCodeFromNationality(nationality);
  const baseClasses = `inline-flex min-w-0 items-center gap-2 ${className ?? ''}`;
  const hasRoute = Boolean(driverId?.trim());

  const content = (
    <>
      {flagCode ? (
        <span
          className={`fi fi-${flagCode} shrink-0 rounded-[2px] shadow-sm`}
          style={{ width: '1.25rem', height: '0.95rem' }}
          role="img"
          aria-label={`${nationality} flag`}
          title={nationality}
        />
      ) : null}
      <span className={`block min-w-0 ${nameClassName ?? ''}`}>
        {givenName} {familyName}
      </span>
    </>
  );

  if (hasRoute) {
    return (
      <Link
        href={`/drivers/${encodeURIComponent(driverId ?? '')}`}
        className={`${baseClasses} transition hover:text-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60`}
      >
        {content}
      </Link>
    );
  }

  return (
    <span className={baseClasses}>
      {content}
    </span>
  );
};

export default DriverNameWithFlag;
