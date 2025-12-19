import React from 'react';
import Footer from '@theme-original/Footer';
import FloatingChatButton from '@site/src/components/FloatingChat';

export default function FooterWrapper(props) {
  return (
    <>
      <FloatingChatButton />
      <Footer {...props} />
    </>
  );
}
