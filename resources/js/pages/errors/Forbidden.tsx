import React from 'react';
import ErrorLayout from '../../components/errors/ErrorLayout';

// Define interface for error props
interface ErrorProps {
    title: string;
    code: string;
    messageTitle: string;
    message: string;
}

// Extend window interface to include errorProps
declare global {
    interface Window {
        errorProps?: ErrorProps;
    }
}

const Forbidden: React.FC = () => {
    const errorProps = window.errorProps || {
        title: '403 Akses Ditolak',
        code: '403',
        messageTitle: 'Akses Ditolak',
        message: 'Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.',
    };

    return <ErrorLayout code={errorProps.code} messageTitle={errorProps.messageTitle} message={errorProps.message} />;
};

export default Forbidden;
