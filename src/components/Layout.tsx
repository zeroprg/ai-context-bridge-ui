import React, { PropsWithChildren } from 'react';
import SlideComponent from './SlideComponent';


interface LayoutProps {
  onSend: (message: string) => void;
}

const Layout: React.FC<PropsWithChildren<LayoutProps>> = ({ children, onSend }) => {


  return (
    <>
      <SlideComponent  onSend={onSend} />
      <div>{children}</div>
    </>
  );
};

export default Layout;
