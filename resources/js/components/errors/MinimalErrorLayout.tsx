import React from 'react';

interface MinimalErrorLayoutProps {
    code?: string;
    messageTitle?: string;
    message?: string;
}

const MinimalErrorLayout: React.FC<MinimalErrorLayoutProps> = ({
    code = 'Oops!',
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
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-5 transition-colors duration-300 dark:bg-slate-800">
            <div className="w-full max-w-2xl rounded-xl bg-white p-8 text-center shadow-lg transition-all duration-300 md:p-12 dark:bg-slate-700 dark:shadow-black/30">
                {/* Error Code */}
                <h1 className="mb-2 text-5xl font-bold text-red-500 md:text-6xl dark:text-red-400">{code}</h1>

                {/* Error Title */}
                <h2 className="mb-6 text-xl font-semibold text-slate-700 md:text-2xl dark:text-slate-200">{messageTitle}</h2>

                {/* Error Message */}
                <p className="mb-8 text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300">{message}</p>

                {/* Action Buttons */}
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                        onClick={handleGoBack}
                        className="inline-block rounded-md bg-slate-500 px-5 py-2.5 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-500/20 dark:bg-slate-600"
                    >
                        Kembali ke Halaman Sebelumnya
                    </button>
                    <button
                        onClick={handleGoHome}
                        className="inline-block rounded-md bg-blue-500 px-5 py-2.5 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 dark:bg-blue-600"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MinimalErrorLayout;
