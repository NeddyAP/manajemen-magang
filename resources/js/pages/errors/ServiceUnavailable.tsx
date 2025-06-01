import React from 'react';
import ErrorLayout from '../../components/errors/ErrorLayout';

const ServiceUnavailable: React.FC = () => {
  const errorProps = (window as any).errorProps || {
    title: '503 Layanan Tidak Tersedia',
    code: '503',
    messageTitle: 'Layanan Sedang Dalam Pemeliharaan',
    message: 'Layanan sedang dalam pemeliharaan untuk meningkatkan kualitas layanan. Silakan coba lagi dalam beberapa saat.'
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

export default ServiceUnavailable;