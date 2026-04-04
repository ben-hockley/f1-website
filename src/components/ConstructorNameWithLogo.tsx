import Image from 'next/image';
import { getConstructorLogoPath } from '@/lib/constructorLogos';

interface ConstructorNameWithLogoProps {
  constructorId: string;
  name: string;
}

const ConstructorNameWithLogo: React.FC<ConstructorNameWithLogoProps> = ({ constructorId, name }) => {
  const logoPath = getConstructorLogoPath(constructorId);

  return (
    <span className="inline-flex items-center gap-2">
      <Image
        src={logoPath}
        alt={`${name} logo`}
        width={32}
        height={20}
        className="h-5 w-8 object-contain"
      />
      <span>{name}</span>
    </span>
  );
};

export default ConstructorNameWithLogo;
