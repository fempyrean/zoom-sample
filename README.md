# About this repository
This repo contains a basic integration of the Zoom Video SDK with a react-native application. Branches will be created for integration with different versions of the SDK, such as `video-sdk@1.5.3`.

**You will have to create a .env file with the following keys:**
- `ZOOM_VIDEO_SDK_KEY`
- `ZOOM_VIDEO_SDK_SECRET`

# Description of the issue
The issue we want to show is with the screen share functionality. We can start screen sharing, but as soon as the app goes to background, the screen sharing freezes until we get back to the app.

### How to reproduce:
We recommend that whoever's testing this have running another client of the Zoom Video SDK, such as the electron client, so you can join the session and see the video feed from the screen share.

1. Run this app and create join session;
2. Run some other client of the Zoom Video SDK and join the same session;
3. Start screen sharing from this app;
4. Send this app to the background by navigating to any other app such as a web browser or the iOS settings app;
5. Notice that while you're using another app, the video feed from the screen share is frozen until you get back to the app.

# Expected behaviour
We expect to be able to keep sharing the screen even when the app is in background, because we want to record the user's actions while screen sharing.