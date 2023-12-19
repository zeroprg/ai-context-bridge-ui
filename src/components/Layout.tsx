import React, { PropsWithChildren } from 'react';
import SlideComponent from './SlideComponent';

const Layout: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <>
      <SlideComponent title='HelloWorld!!!'/>
      <div>{children}</div>
    </>
  );
};

export default Layout;
 