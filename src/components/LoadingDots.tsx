const LoadingDots: React.FC = () => {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-pulse flex space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-400"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  };


  export default LoadingDots;
  