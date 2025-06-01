import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

// Import error page components
import Forbidden from './pages/errors/Forbidden';
import NotFound from './pages/errors/NotFound';
import InternalServerError from './pages/errors/InternalServerError';
import ServiceUnavailable from './pages/errors/ServiceUnavailable';

// Initialize theme on load
initializeTheme();

// Get error props from window object
const errorProps = (window as any).errorProps || {
    code: '500',
    title: 'Terjadi Kesalahan',
    messageTitle: 'Ada yang Salah',
    message: 'Maaf, kami mengalami sedikit kendala. Silakan coba lagi nanti atau kembali ke beranda.'
};

// Get the root element
const el = document.getElementById('error-app');

if (el) {
    const root = createRoot(el);
    
    // Render the appropriate error component based on the error code
    const renderErrorComponent = () => {
        switch (errorProps.code) {
            case '403':
                return <Forbidden />;
            case '404':
                return <NotFound />;
            case '500':
                return <InternalServerError />;
            case '503':
                return <ServiceUnavailable />;
            default:
                return <InternalServerError />;
        }
    };

    root.render(renderErrorComponent());
}