import React from 'react';

interface MinimalErrorLayoutProps {
  title?: string;
  code?: string;
  messageTitle?: string;
  message?: string;
}

const MinimalErrorLayout: React.FC<MinimalErrorLayoutProps> = ({
  title = 'Terjadi Kesalahan',
  code = 'Oops!',
  messageTitle = 'Ada yang Salah',
  message = 'Maaf, kami mengalami sedikit kendala. Silakan coba lagi nanti atau kembali ke beranda.'
}) => {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-5 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg dark:shadow-black/30 p-8 md:p-12 max-w-2xl w-full text-center transition-all duration-300">
        {/* Error Code */}
        <h1 className="text-5xl md:text-6xl font-bold text-red-500 dark:text-red-400 mb-2">
          {code}
        </h1>
        
        {/* Error Title */}
        <h2 className="text-xl md:text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-6">
          {messageTitle}
        </h2>
        
        {/* Error Message */}
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
          {message}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="inline-block px-5 py-2.5 text-base font-semibold text-white bg-slate-500 dark:bg-slate-600 rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-500/20"
          >
            Kembali ke Halaman Sebelumnya
          </button>
          <button
            onClick={handleGoHome}
            className="inline-block px-5 py-2.5 text-base font-semibold text-white bg-blue-500 dark:bg-blue-600 rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinimalErrorLayout;