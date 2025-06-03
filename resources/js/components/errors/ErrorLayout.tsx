import React from 'react';

interface ErrorLayoutProps {
    code?: string;
    messageTitle?: string;
    message?: string;
}

const ErrorLayout: React.FC<ErrorLayoutProps> = ({
    code = '500',
    messageTitle = 'Ada yang Salah',
    message = 'Maaf, kami mengalami sedikit kendala. Silakan coba lagi nanti atau kembali ke beranda.',
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

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-tr from-blue-100 via-blue-200 to-blue-600 p-3 transition-colors duration-200 sm:p-4 md:p-5 lg:p-6 dark:from-gray-800 dark:via-gray-900 dark:to-black">
                {/* Stars Background */}
                <div className="stars-bg absolute inset-0 opacity-20 sm:opacity-25 md:opacity-30"></div>

                <div className="relative z-20 grid w-full max-w-6xl grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:grid-cols-2 xl:gap-12">
                    {/* Left Side - Space Scene - Hidden on smaller screens */}
                    <div className="relative hidden min-h-auto items-center justify-center p-10 xl:flex">
                        <div className="relative flex h-[480px] w-[480px] items-center justify-center">
                            {/* Background Error Code */}
                            <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform text-[20rem] leading-none font-black text-black/5 select-none dark:text-white/10">
                                {code}
                            </div>

                            {/* Astronaut */}
                            <img
                                src="/assets/error/astronout.png"
                                alt="Astronaut"
                                className="w-xm float-animation absolute top-[10%] left-[20%] z-40 h-auto drop-shadow-lg"
                            />

                            {/* Rocket */}
                            <img
                                src="/assets/error/Roket.png"
                                alt="Rocket"
                                className="rocket-float-animation absolute top-[22%] right-[20%] z-30 h-auto w-lg drop-shadow-lg"
                            />

                            {/* Planet */}
                            <img
                                src="/assets/error/planet.png"
                                alt="Planet"
                                className="w-xm rotate-animation absolute right-[-5%] bottom-0 z-40 h-auto drop-shadow-lg"
                            />
                        </div>
                    </div>

                    {/* Right Side - Content Section - Full width on smaller screens */}
                    <div className="flex flex-col items-center justify-center p-6 text-center sm:p-8 md:p-10 lg:p-12 xl:items-start xl:p-12 xl:text-left">
                        {/* Error Code */}
                        <div className="mobile-small-code font-inter mb-4 text-5xl leading-none font-extrabold text-gray-800 drop-shadow-lg sm:mb-6 sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl dark:text-white">
                            {code}
                        </div>

                        {/* Error Title */}
                        <h1 className="mb-4 px-2 text-xl leading-tight font-bold text-gray-800 drop-shadow-md sm:mb-6 sm:text-2xl md:text-3xl lg:text-4xl xl:text-3xl dark:text-white">
                            {messageTitle}
                        </h1>

                        {/* Error Message */}
                        <p className="mobile-small-text mb-8 max-w-lg px-2 text-base leading-relaxed text-gray-700 drop-shadow-sm sm:mb-10 sm:max-w-xl sm:text-lg md:mb-12 md:max-w-2xl md:text-xl lg:text-2xl xl:max-w-md xl:text-xl dark:text-white/90">
                            {message}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex w-full max-w-md flex-col justify-center gap-4 sm:max-w-lg sm:flex-row lg:justify-start xl:w-auto xl:max-w-none xl:justify-start">
                            <button
                                onClick={handleGoBack}
                                className="inline-flex w-full min-w-[140px] items-center justify-center rounded-lg border-2 border-gray-300 bg-white/30 px-6 py-3 text-base font-semibold text-gray-700 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-400 hover:bg-white/50 hover:shadow-lg sm:w-auto sm:min-w-[160px] sm:px-8 sm:py-4 sm:text-lg md:px-10 xl:flex-none dark:border-white/30 dark:bg-white/20 dark:text-white dark:hover:border-white/50 dark:hover:bg-white/30"
                            >
                                Kembali
                            </button>
                            <button
                                onClick={handleGoHome}
                                className="inline-flex w-full min-w-[140px] items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 sm:w-auto sm:min-w-[160px] sm:px-8 sm:py-4 sm:text-lg md:px-10 xl:flex-none dark:bg-blue-500 dark:hover:bg-blue-600"
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
