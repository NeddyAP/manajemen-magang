import React from 'react';
import ErrorLayout from '../../components/errors/ErrorLayout';

const NotFound: React.FC = () => {
  const errorProps = (window as any).errorProps || {
    title: '404 Tidak Ditemukan',
    code: '404',
    messageTitle: 'Halaman Tidak Ditemukan',
    message: 'Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan atau alamat URL salah.'
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

export default NotFound;