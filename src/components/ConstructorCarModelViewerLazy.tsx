'use client';

import dynamic from 'next/dynamic';

interface ConstructorCarModelViewerLazyProps {
  constructorId: string;
  constructorName: string;
  className?: string;
}

const ConstructorCarModelViewer = dynamic(() => import('@/components/ConstructorCarModelViewer'), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

export default function ConstructorCarModelViewerLazy({
  constructorId,
  constructorName,
  className,
}: ConstructorCarModelViewerLazyProps) {
  return <ConstructorCarModelViewer constructorId={constructorId} constructorName={constructorName} className={className} />;
}
