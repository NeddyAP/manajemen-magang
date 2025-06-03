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

const ServiceUnavailable: React.FC = () => {
    const errorProps = window.errorProps || {
        title: '503 Service Unavailable',
        code: '503',
        messageTitle: 'Layanan Tidak Tersedia',
        message: 'Maaf, layanan sedang dalam pemeliharaan. Kami akan kembali sebentar lagi. Terima kasih atas kesabaran Anda.',
    };

    return <ErrorLayout code={errorProps.code} messageTitle={errorProps.messageTitle} message={errorProps.message} />;
};

export default ServiceUnavailable;
