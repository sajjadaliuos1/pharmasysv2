import { useState, useEffect } from 'react';
import { theme } from 'antd';

const useScreenSize = (gridRef = null) => {
  const { token } = theme.useToken();
  const [screenSize, setScreenSize] = useState('xl');

  useEffect(() => {
    const handleResize = () => {
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

      // ✅ Delay API call until gridRef is available
      if (gridRef?.current?.api) {
        setTimeout(() => {
          try {
            gridRef.current.api.sizeColumnsToFit();
          } catch (e) {
            console.warn('Grid API is not ready yet:', e);
          }
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);

    // 🔐 Only call resize if gridRef is ready
    if (gridRef?.current?.api) {
      handleResize(); // initial call
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [gridRef, token]);

  return screenSize;
};

export default useScreenSize;
