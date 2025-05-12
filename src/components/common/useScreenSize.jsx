import { useState, useEffect } from 'react';
import { theme } from 'antd';

const useScreenSize = (gridRef = null) => {
  const { token } = theme.useToken();
  const [screenSize, setScreenSize] = useState('xl');
  
  useEffect(() => {
    const handleResize = () => {
      // Using Ant Design's breakpoints
      const width = window.innerWidth;
      let newSize;
      
      if (width < token.screenXSMin) {
        newSize = 'xs';
      } else if (width < token.screenSMMin) {
        newSize = 'sm';
      } else if (width < token.screenMDMin) {
        newSize = 'md';
      } else if (width < token.screenLGMin) {
        newSize = 'lg';
      } else if (width < token.screenXLMin) {
        newSize = 'xl';
      } else {
        newSize = 'xxl';
      }
      
      setScreenSize(newSize);
      
      // Handle grid resizing if gridRef is provided
      if (gridRef?.current?.api) {
        setTimeout(() => {
          gridRef.current.api.sizeColumnsToFit();
        }, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [gridRef, token]);
  
  return screenSize;
};

export default useScreenSize;