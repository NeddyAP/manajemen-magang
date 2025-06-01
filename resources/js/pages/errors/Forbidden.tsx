import React from 'react';
import ErrorLayout from '../../components/errors/ErrorLayout';

const Forbidden: React.FC = () => {
  const errorProps = (window as any).errorProps || {
    title: '403 Akses Ditolak',
    code: '403',
    messageTitle: 'Akses Ditolak',
    message: 'Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.'
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

export default Forbidden;