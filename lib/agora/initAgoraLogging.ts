import AgoraRTC, { AREAS } from "agora-rtc-sdk-ng";

AgoraRTC.setArea({
  areaCode: [AREAS.GLOBAL],
});

export const initAgoraLogging = () => {
  AgoraRTC.disableLogUpload();
  AgoraRTC.setLogLevel(4);
};
