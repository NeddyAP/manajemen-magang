import React from 'react';

interface ErrorLayoutProps {
  title?: string;
  code?: string;
  messageTitle?: string;
  message?: string;
  children?: React.ReactNode;
}

const ErrorLayout: React.FC<ErrorLayoutProps> = ({
  title = 'Terjadi Kesalahan',
  code = '500',
  messageTitle = 'Ada yang Salah',
  message = 'Maaf, kami mengalami sedikit kendala. Silakan coba lagi nanti atau kembali ke beranda.',
  children
}) => {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        
        @keyframes rocket-float {
          0%, 100% { transform: translateY(0px) rotate(5deg); }
          50% { transform: translateY(-20px) rotate(-5deg); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .float-animation {
          animation: float 8s ease-in-out infinite;
        }
        
        .rocket-float-animation {
          animation: rocket-float 12s ease-in-out infinite;
        }
        
        .rotate-animation {
          animation: rotate 25s linear infinite;
        }
        
        .stars-bg {
          background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="stars" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="18" cy="15" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="18" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23stars)"/></svg>');
        }

        /* Responsive adjustments for very small screens */
        @media (max-width: 375px) {
          .mobile-small-text {
            font-size: 0.875rem !important;
          }
          .mobile-small-code {
            font-size: 3rem !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-blue-200 to-blue-600 transition-colors duration-200 dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center p-3 sm:p-4 md:p-5 lg:p-6 relative overflow-hidden">
        {/* Stars Background */}
        <div className="absolute inset-0 stars-bg opacity-20 sm:opacity-25 md:opacity-30"></div>
        
        <div className="max-w-6xl w-full grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 z-20 relative">
          
          {/* Left Side - Space Scene - Hidden on smaller screens */}
          <div className="hidden xl:flex items-center justify-center p-10 relative min-h-auto">
            <div className="relative w-[480px] h-[480px] flex items-center justify-center">
              {/* Background Error Code */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black/5 dark:text-white/10 text-[20rem] font-black leading-none select-none pointer-events-none z-10">
                {code}
              </div>
              
              {/* Astronaut */}
              <img 
                src="/assets/error/astronout.png" 
                alt="Astronaut" 
                className="absolute top-[10%] left-[20%] w-xm h-auto z-40 float-animation drop-shadow-lg"
              />
              
              {/* Rocket */}
              <img 
                src="/assets/error/Roket.png" 
                alt="Rocket" 
                className="absolute top-[22%] right-[20%] w-lg h-auto z-30 rocket-float-animation drop-shadow-lg"
              />
              
              {/* Planet */}
              <img 
                src="/assets/error/planet.png" 
                alt="Planet" 
                className="absolute bottom-0 right-[-5%] w-xm h-auto z-40 rotate-animation drop-shadow-lg"
              />

            </div>
          </div>
          
          {/* Right Side - Content Section - Full width on smaller screens */}
          <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-12 flex flex-col justify-center items-center text-center xl:items-start xl:text-left">
            {/* Error Code */}
            <div className="text-5xl mobile-small-code sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-extrabold text-gray-800 dark:text-white leading-none mb-4 sm:mb-6 font-inter drop-shadow-lg">
              {code}
            </div>
            
            {/* Error Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-3xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 leading-tight drop-shadow-md px-2">
              {messageTitle}
            </h1>
            
            {/* Error Message */}
            <p className="text-base mobile-small-text sm:text-lg md:text-xl lg:text-2xl xl:text-xl leading-relaxed text-gray-700 dark:text-white/90 mb-8 sm:mb-10 md:mb-12 max-w-lg sm:max-w-xl md:max-w-2xl xl:max-w-md drop-shadow-sm px-2">
              {message}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md sm:max-w-lg justify-center xl:max-w-none xl:w-auto lg:justify-start xl:justify-start">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold text-gray-700 dark:text-white bg-white/30 dark:bg-white/20 backdrop-blur-sm border-2 border-gray-300 dark:border-white/30 rounded-lg transition-all duration-200 hover:bg-white/50 dark:hover:bg-white/30 hover:border-gray-400 dark:hover:border-white/50 hover:-translate-y-0.5 hover:shadow-lg min-w-[140px] sm:min-w-[160px] w-full sm:w-auto xl:flex-none"
              >
                Kembali
              </button>
              <button
                onClick={handleGoHome}
                className="inline-flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-lg transition-all duration-200 hover:bg-blue-700 dark:hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 min-w-[140px] sm:min-w-[160px] w-full sm:w-auto xl:flex-none"
              >
                Ke Beranda
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ErrorLayout;
