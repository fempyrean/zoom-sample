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
      ({status}) => {
        setIsScreenSharing(status === ShareStatus.Start);
        console.log('Screen sharing status:', status);
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
      leaveSession();
    } else {
      joinSession();
    }
  };

  const joinSession = async () => {
    setLoading(true);

    const sessionName = 'sample_session';
    const token = generateSessionToken(sessionName);

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
      stopCloudRecording();
    } else {
      startCloudRecording();
    }
  };

  const startCloudRecording = () => {
    zoom.recordingHelper.startCloudRecording();
  };

  const stopCloudRecording = () => {
    zoom.recordingHelper.stopCloudRecording();
  };

  const screenSharingButtonPressed = async () => {
    if (isScreenSharing) {
      stopScreenSharing();
    } else {
      startScreenSharing();
    }
  };

  const startScreenSharing = async () => {
    const zoomHelper = await zoom.shareHelper;
    const isOtherSharing = await zoomHelper.isOtherSharing();
    const isShareLocked = await zoomHelper.isShareLocked();

    if (isOtherSharing || isShareLocked) {
      console.log('Cannot start screen sharing');
    } else {
      zoomHelper.shareScreen();
    }
  };

  const stopScreenSharing = async () => {
    await zoom.shareHelper.stopShare();
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
