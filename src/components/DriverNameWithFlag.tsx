import { getFlagCodeFromNationality } from '@/lib/nationalityFlags';

interface DriverNameWithFlagProps {
  givenName: string;
  familyName: string;
  nationality: string;
  className?: string;
  nameClassName?: string;
}

const DriverNameWithFlag: React.FC<DriverNameWithFlagProps> = ({
  givenName,
  familyName,
  nationality,
  className,
  nameClassName,
}) => {
  const flagCode = getFlagCodeFromNationality(nationality);

  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className ?? ''}`}>
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
    </span>
  );
};

export default DriverNameWithFlag;
