import React from 'react';
import ErrorLayout from '../../components/errors/ErrorLayout';

const InternalServerError: React.FC = () => {
  const errorProps = (window as any).errorProps || {
    title: '500 Kesalahan Server',
    code: '500',
    messageTitle: 'Kesalahan Server Internal',
    message: 'Maaf, terjadi kesalahan pada server. Tim kami telah diberitahu dan sedang menangani masalah ini. Silakan coba lagi nanti.'
  };

  return (
    <ErrorLayout
      title={errorProps.title}
      code={errorProps.code}
      messageTitle={errorProps.messageTitle}
      message={errorProps.message}
    />
  );
};

export default InternalServerError;