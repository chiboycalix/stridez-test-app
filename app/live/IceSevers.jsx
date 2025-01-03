export const iceServers = [
  {
    urls: [
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
      "stun:stun.stridez.ca:5349"
    ],
  },
  {
    urls: "turn:turn.stridez.ca:5349",
    username: "1724432701",
    credential: "Sded7be2f8b12834f5df1f9fa7ea93bf4",
  },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "a2d9414a97a9cd294f64341e",
    credential: "7AYy0djc3hn8a4gL",
  },
  {
    urls: "turn:global.relay.metered.ca:80",
    username: "a2d9414a97a9cd294f64341e",
    credential: "7AYy0djc3hn8a4gL",
  },
  {
    urls: "turn:global.relay.metered.ca:80?transport=tcp",
    username: "a2d9414a97a9cd294f64341e",
    credential: "7AYy0djc3hn8a4gL",
  },
  {
    urls: "turn:global.relay.metered.ca:443",
    username: "a2d9414a97a9cd294f64341e",
    credential: "7AYy0djc3hn8a4gL",
  },
  {
    urls: "turns:global.relay.metered.ca:443?transport=tcp",
    username: "a2d9414a97a9cd294f64341e",
    credential: "7AYy0djc3hn8a4gL",
  },
  {
    urls: "turn:numb.viagenie.ca",
    credential: "muazkh",
    username: "webrtc@live.com",
  },
  {
    urls: "turn:192.158.29.39:3478?transport=udp",
    credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
    username: "28224511:1379330808",
  },
  {
    urls: "turn:192.158.29.39:3478?transport=tcp",
    credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
    username: "28224511:1379330808",
  },
  {
    urls: "turn:turn.bistri.com:80",
    credential: "homeo",
    username: "homeo",
  },
  {
    urls: "turn:turn.anyfirewall.com:443?transport=tcp",
    credential: "webrtc",
    username: "webrtc",
  },
];
