import { getFlagCodeFromNationality } from '@/lib/nationalityFlags';

interface DriverNameWithFlagProps {
  givenName: string;
  familyName: string;
  nationality: string;
}

const DriverNameWithFlag: React.FC<DriverNameWithFlagProps> = ({ givenName, familyName, nationality }) => {
  const flagCode = getFlagCodeFromNationality(nationality);

  return (
    <span className="inline-flex items-center gap-2">
      {flagCode ? (
        <span
          className={`fi fi-${flagCode} rounded-[2px] shadow-sm`}
          style={{ width: '1.25rem', height: '0.95rem' }}
          role="img"
          aria-label={`${nationality} flag`}
          title={nationality}
        />
      ) : null}
      <span>
        {givenName} {familyName}
      </span>
    </span>
  );
};

export default DriverNameWithFlag;
