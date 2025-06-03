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

const NotFound: React.FC = () => {
    const errorProps = window.errorProps || {
        title: '404 Halaman Tidak Ditemukan',
        code: '404',
        messageTitle: 'Halaman Tidak Ditemukan',
        message: 'Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan atau dihapus.',
    };

    return <ErrorLayout code={errorProps.code} messageTitle={errorProps.messageTitle} message={errorProps.message} />;
};

export default NotFound;
