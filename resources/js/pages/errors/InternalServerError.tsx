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

const InternalServerError: React.FC = () => {
    const errorProps = window.errorProps || {
        title: '500 Internal Server Error',
        code: '500',
        messageTitle: 'Server Mengalami Kendala',
        message: 'Maaf, server kami sedang mengalami kendala. Tim teknis sedang menangani masalah ini. Silakan coba lagi nanti.',
    };

    return <ErrorLayout code={errorProps.code} messageTitle={errorProps.messageTitle} message={errorProps.message} />;
};

export default InternalServerError;
