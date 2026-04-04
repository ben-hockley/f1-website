import Image from 'next/image';
import { getConstructorLogoPath } from '@/lib/constructorLogos';

interface ConstructorNameWithLogoProps {
  constructorId: string;
  name: string;
  className?: string;
  nameClassName?: string;
}

const ConstructorNameWithLogo: React.FC<ConstructorNameWithLogoProps> = ({
  constructorId,
  name,
  className,
  nameClassName,
}) => {
  const logoPath = getConstructorLogoPath(constructorId);

  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className ?? ''}`}>
      <Image
        src={logoPath}
        alt={`${name} logo`}
        width={32}
        height={20}
        className="h-5 w-8 shrink-0 object-contain"
      />
      <span className={`block min-w-0 ${nameClassName ?? ''}`}>{name}</span>
    </span>
  );
};

export default ConstructorNameWithLogo;
