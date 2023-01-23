/* eslint-disable @typescript-eslint/no-shadow */
import React, {useState, useEffect} from 'react';
import {ActivityIndicator, View, Text, StyleSheet, Button} from 'react-native';
import {
  EventType,
  Errors,
  useZoom,
  RecordingStatus,
  ShareStatus,
  ZoomView,
  ZoomVideoSdkUserType,
  ZoomVideoSdkUser,
} from '@zoom/react-native-videosdk';

import {generateSessionToken} from './utils/session-token';

const Home = () => {
  const zoom = useZoom();
  const [user, setUser] = useState<ZoomVideoSdkUserType | null>();
  const [loading, setLoading] = useState(false);
  const [inSession, setInSession] = useState(false);
  const [isCloudRecording, setIsCloudRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVideoOn, setVideoOn] = useState(false);

  useEffect(() => {
    const errorListener = zoom.addListener(EventType.onError, error => {
      console.log('Error:', error);
      setLoading(false);
    });

    const sessionJoinListener = zoom.addListener(
      EventType.onSessionJoin,
      ({mySelf}) => {
        console.log('Myself:', mySelf);
        setUser(mySelf);
        setInSession(true);
        setLoading(false);
      },
    );

    const cloudRecordingListener = zoom.addListener(
      EventType.onCloudRecordingStatus,
      ({status}) => {
        switch (status) {
          case RecordingStatus.Start:
            setIsCloudRecording(true);
            break;
          case RecordingStatus.Stop:
            setIsCloudRecording(false);
            break;
          default:
            console.log(`Uncaught status: ${JSON.stringify(status)}`);
        }
        console.log('Cloud recording status listener:', status);
      },
    );

    const screenSharingListener = zoom.addListener(
      EventType.onUserShareStatusChanged,
      async ({user, status}: {user: ZoomVideoSdkUser; status: ShareStatus}) => {
        setIsScreenSharing(status === ShareStatus.Start);
        console.log('Screen sharing status:', status);
        console.log('User name:', user.userName);
      },
    );

    return () => {
      errorListener.remove();
      sessionJoinListener.remove();
      cloudRecordingListener.remove();
      screenSharingListener.remove();
    };
  });

  const sessionButtonPressed = async () => {
    if (inSession) {
      await leaveSession();
    } else {
      await joinSession();
    }
  };

  const joinSession = async () => {
    setLoading(true);

    const sessionName = 'sdk';
    const token = generateSessionToken(sessionName);

    // @ts-ignore
    await zoom.joinSession({
      sessionName,
      token,
      userName: 'sample_user',
      sessionIdleTimeoutMins: 5,
      audioOptions: {
        connect: true,
        mute: false,
      },
      videoOptions: {
        localVideoOn: false,
      },
    });
  };

  const leaveSession = async () => {
    zoom.leaveSession(true);
    setInSession(false);
    setUser(null);
  };

  const videoButtonPressed = () => {
    isVideoOn ? turnVideoOff() : turnVideoOn();
  };

  const turnVideoOn = async () => {
    const startVideoResponse = await zoom.videoHelper.startVideo();
    if (startVideoResponse === Errors.Success) {
      setVideoOn(true);
    }
  };

  const turnVideoOff = async () => {
    const stopVideoResponse = await zoom.videoHelper.stopVideo();
    if (stopVideoResponse === Errors.Success) {
      setVideoOn(false);
    }
  };

  const cloudRecordingButtonPressed = async () => {
    if (isCloudRecording) {
      await stopCloudRecording();
    } else {
      await startCloudRecording();
    }
  };

  const startCloudRecording = async () => {
    console.log(await zoom.recordingHelper.startCloudRecording());
  };

  const stopCloudRecording = async () => {
    console.log(await zoom.recordingHelper.stopCloudRecording());
  };

  const screenSharingButtonPressed = async () => {
    await zoom.shareHelper.lockShare(false);
    const isOtherSharing = await zoom.shareHelper.isOtherSharing();
    const isShareLocked = await zoom.shareHelper.isShareLocked();

    if (isOtherSharing) {
      console.log('Other is sharing');
    } else if (isShareLocked) {
      console.log('Share is locked by host');
    } else if (isScreenSharing) {
      await zoom.shareHelper.stopShare();
    } else {
      await zoom.shareHelper.shareScreen();
    }
  };

  return (
    <View style={styles.container}>
      <Text>{`Is in session: ${inSession}`}</Text>

      <Button
        title={inSession ? 'Leave session' : 'Join session'}
        onPress={sessionButtonPressed}
      />

      <Button
        title={isVideoOn ? 'Turn video off' : 'Turn video on'}
        onPress={videoButtonPressed}
        disabled={!inSession}
      />

      <Button
        title={
          isCloudRecording ? 'Stop cloud recording' : 'Start cloud recording'
        }
        onPress={cloudRecordingButtonPressed}
        disabled={!inSession}
      />

      <Button
        title={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
        onPress={screenSharingButtonPressed}
        disabled={!inSession}
      />

      <ActivityIndicator style={styles.loading} animating={loading} />

      <View style={styles.videoContainer}>
        {user && (
          <ZoomView
            style={styles.zoomView}
            userId={user.userId}
            sharing={false}
            preview={false}
            hasMultiCamera={false}
            multiCameraIndex={'0'}
            fullScreen
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  loading: {
    margin: 15,
  },
  videoContainer: {
    width: 350,
    height: 350,
    backgroundColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomView: {
    width: 350,
    height: 350,
  },
});

export default Home;
