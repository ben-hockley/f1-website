interface LoadingCardProps {
  message?: string;
  minHeight?: string;
}

const LoadingCard: React.FC<LoadingCardProps> = ({
  message = 'Loading...',
  minHeight = 'min-h-[300px]',
}) => {
  return (
    <div
      className={`bg-gray-800 rounded-lg shadow-md p-4 ${minHeight} flex items-center justify-center text-white`}
    >
      {message}
    </div>
  );
};

export default LoadingCard;
