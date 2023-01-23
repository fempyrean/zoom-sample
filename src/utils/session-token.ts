import {KJUR} from 'jsrsasign';

export const generateSessionToken = (sessionName: string) => {
  try {
    // TODO: Make sure the expiration is not less than the study duration
    const iat = Math.round((new Date().getTime() - 30000) / 1000);
    const exp = iat + 60 * 60 * 2;

    const oHeader = {alg: 'HS256', typ: 'JWT'};

    const oPayload = {
      app_key: process.env.ZOOM_VIDEO_SDK_KEY,
      tpc: sessionName,
      role_type: 1,
      user_identity: '',
      session_key: '',
      iat,
      exp,
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    const signature = KJUR.jws.JWS.sign(
      'HS256',
      sHeader,
      sPayload,
      process.env.ZOOM_VIDEO_SDK_SECRET,
    );

    return signature;
  } catch (e) {
    console.log(e);
    return '';
  }
};
