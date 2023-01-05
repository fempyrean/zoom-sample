import React from 'react';
import {ZoomVideoSdkProvider} from '@zoom/react-native-videosdk';

import Home from './Home';

const App = () => {
  const appGroupId = 'group.com.gmail.frempyrean.Zoom-Sample';
  const config = {
    appGroupId,
    domain: 'zoom.us',
    enableLog: true,
  };

  return (
    <ZoomVideoSdkProvider config={config}>
      <Home />
    </ZoomVideoSdkProvider>
  );
};

export default App;
