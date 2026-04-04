import { getFlagCodeFromCountry } from '@/lib/countryFlags';

interface LocationWithFlagProps {
  locality: string;
  country: string;
}

const LocationWithFlag: React.FC<LocationWithFlagProps> = ({ locality, country }) => {
  const flagCode = getFlagCodeFromCountry(country);

  return (
    <span className="inline-flex items-center gap-2">
      <span>
        {locality}, {country}
      </span>
      {flagCode ? (
        <span
          className={`fi fi-${flagCode} rounded-[2px] shadow-sm`}
          style={{ width: '1.25rem', height: '0.95rem' }}
          role="img"
          aria-label={`${country} flag`}
          title={country}
        />
      ) : null}
    </span>
  );
};

export default LocationWithFlag;