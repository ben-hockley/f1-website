import Image from 'next/image';
import Link from 'next/link';
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
  const baseClasses = `inline-flex min-w-0 items-center gap-2 ${className ?? ''}`;
  const hasRoute = Boolean(constructorId.trim());

  const content = (
    <>
      <Image
        src={logoPath}
        alt={`${name} logo`}
        width={32}
        height={20}
        className="h-5 w-8 shrink-0 object-contain"
      />
      <span className={`block min-w-0 ${nameClassName ?? ''}`}>{name}</span>
    </>
  );

  if (hasRoute) {
    return (
      <Link
        href={`/constructors/${encodeURIComponent(constructorId)}`}
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

export default ConstructorNameWithLogo;
