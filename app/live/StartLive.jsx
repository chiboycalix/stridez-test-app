import React, { useCallback, useEffect, useRef, useState } from "react";
import "../../styles/LiveUpdate.css";
import "../../styles/Muted.css";
import Audio from "../../assets/Audio.png";
import AudioLess from "../../assets/AudioLess.png";
import Camera from "../../assets/Camera.png";
import CameraLess from "../../assets/CameraLess.png";
import SettingBar from "../../assets/SettingBar.png";
import List from "../../assets/List.png";
import { useNavigate } from "react-router-dom";
import SideBar from "../Explore/SideBar";
import { useAuth } from "../../Providers/AuthProvider";
import io from "socket.io-client";

const StartLive = () => {
  const [allowAudio, setAllowAudio] = useState(true);
  const [allowCamera, setAllowCamera] = useState(true);
  const [showBeneathImage, setShowBeneathImage] = useState(false);
  const { auth, setAuth, getCurrentUser, getAuth } = useAuth();
  const [userInitial, setUserInitial] = useState("");
  const [userName, setUserName] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [joinRequests, setJoinRequests] = useState([]);
  const user = getCurrentUser();
  const [remoteStreams, setRemoteStreams] = useState([]);
  const remoteVideoRefs = useRef({});
  const socketIdRef = useRef(null);

  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnections = useRef({});

  // const startVideo = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: allowCamera,
  //       audio: allowAudio,
  //     });
  //     localVideoRef.current.srcObject = stream;
  //     streamRef.current = stream;
  //   } catch (err) {
  //     console.error("Error accessing webcam: ", err);
  //   }
  // };

  // const stopVideo = () => {
  //   if (streamRef.current) {
  //     streamRef.current.getTracks().forEach((track) => track.stop());

  //     streamRef.current.getVideoTracks().forEach((track) => track.stop());
  //     streamRef.current.getAudioTracks().forEach((track) => track.stop());

  //     if (localVideoRef.current && localVideoRef.current.srcObject) {
  //       localVideoRef.current.srcObject
  //         .getTracks()
  //         .forEach((track) => track.stop());
  //       localVideoRef.current.srcObject = null;
  //     }

  //     streamRef.current = null;
  //   }

  //   Object.values(peerConnections.current).forEach((peerConnection) => {
  //     peerConnection.getSenders().forEach((sender) => {
  //       if (sender.track) {
  //         sender.track.stop();
  //       }
  //     });
  //     peerConnection.close();
  //   });
  //   peerConnections.current = {};
  // };

  // const startVideo = useCallback(async () => {
  //   try {
  //     if (!streamRef.current) {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: allowCamera,
  //         audio: allowAudio,
  //       });
  //       localVideoRef.current.srcObject = stream;
  //       streamRef.current = stream;
  //     } else {
  //       streamRef.current.getVideoTracks().forEach((track) => {
  //         track.enabled = allowCamera;
  //       });
  //       streamRef.current.getAudioTracks().forEach((track) => {
  //         track.enabled = allowAudio;
  //       });
  //     }
  //   } catch (err) {
  //     console.error("Error accessing webcam: ", err);
  //   }
  // }, [allowCamera, allowAudio]);

  // Define startVideo with useCallback
  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: allowCamera,
        audio: allowAudio,
      });
      localVideoRef.current.srcObject = stream;
      streamRef.current = stream;

      setRemoteStreams((prevStreams) =>
        prevStreams.map((remoteStream) =>
          remoteStream.userId === socketIdRef
            ? { ...remoteStream, stream: streamRef.current }
            : remoteStream
        )
      );
    } catch (err) {
      console.error("Error accessing webcam: ", err);
    }
  }, [allowCamera, allowAudio, socketIdRef]);


  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
      streamRef.current = null;
    }

    Object.values(peerConnections.current).forEach((peerConnection) => {
      peerConnection.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      peerConnection.close();
    });
    peerConnections.current = {};
  };

  useEffect(() => {
    const user = getCurrentUser();
    setUserInitial(`${user?.firstName[0]}${user?.lastName[0]}`);
    setUserName(`${user?.firstName}`);
    if (allowCamera || allowAudio) {
      startVideo();
    } else {
      stopVideo();
    }

    if (user?.firstName) {
      socketRef.current = io("https://banji-stridez.onrender.com");
      // socketRef.current = io("http://localhost:4000");

      socketRef.current.on("connect", async () => {
        console.log("Connected to signaling server");
        socketIdRef.current = socketRef.id;

        socketRef.current.emit("join-room", "live-room", {
          userName: user?.firstName,
        });

        socketRef.current.on("user-count", (count) => {
          setUserCount(count);
        });

        socketRef.current.on("receive-ice-candidate", (candidate, userId) => {
          console.log("ICE candidate received:", candidate);
          const peerConnection = peerConnections.current[userId];
          if (peerConnection) {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        socketRef.current.on("offer", async (offer, userId) => {
          console.log("Offer received:", offer);
          const peerConnection = createPeerConnection(userId);
          try {
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(offer)
            );
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socketRef.current.emit("answer", answer, userId);
          } catch (err) {
            console.error("Error handling offer:", err);
          }
        });

        socketRef.current.on("answer", async (answer, userId) => {
          console.log("Answer received:", answer);
          const peerConnection = peerConnections.current[userId];
          if (peerConnection) {
            try {
              await peerConnection.setRemoteDescription(
                new RTCSessionDescription(answer)
              );
            } catch (err) {
              console.error("Error setting remote description:", err);
            }
          }
        });

        socketRef.current.on("user-connected", async (userId) => {
          console.log("New user connected:", userId);
          const peerConnection = createPeerConnection(userId);
          peerConnections.current[userId] = peerConnection;
          try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socketRef.current.emit("offer", offer, userId);
          } catch (err) {
            console.error("Error handling new user connection:", err);
          }
        });

        socketRef.current.on("user-disconnected", (userId) => {
          console.log("User disconnected:", userId);
          const peerConnection = peerConnections.current[userId];
          if (peerConnection) {
            peerConnection.close();
          }
          delete peerConnections.current[userId];
          setRemoteStreams((prevStreams) =>
            prevStreams.filter((stream) => stream.userId !== userId)
          );
        });
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
        Object.values(peerConnections.current).forEach((peerConnection) => {
          peerConnection.close();
        });
        peerConnections.current = {};
      };
    }
  }, [allowAudio, allowCamera, startVideo, getCurrentUser]);

  const createPeerConnection = (userId) => {
    if (!streamRef.current) {
      console.error("Local stream is not available");
      return;
    }
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "c844747b0360e6c61b60415c",
          credential: "9Vo1barr6KRVsj87",
        },
        {
          urls: "turn:global.relay.metered.ca:80",
          username: "c844747b0360e6c61b60415c",
          credential: "9Vo1barr6KRVsj87",
        },
        {
          urls: "turn:global.relay.metered.ca:80?transport=tcp",
          username: "c844747b0360e6c61b60415c",
          credential: "9Vo1barr6KRVsj87",
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username: "c844747b0360e6c61b60415c",
          credential: "9Vo1barr6KRVsj87",
        },
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: "c844747b0360e6c61b60415c",
          credential: "9Vo1barr6KRVsj87",
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
      ],
      iceTransportPolicy: 'relay',
      iceCandidatePoolSize: 10, 
    });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, streamRef.current);
      });
    } else {
      console.error("No stream available to add tracks");
    }

    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log("Local ICE candidate:", event.candidate);
        // Ensure the peer connection is open
        if (peerConnection.signalingState !== "closed") {
          socketRef.current.emit("send-ice-candidate", {
            candidate: event.candidate,
            userId,
          });
        }
      }
    };

    peerConnection.ontrack = (event) => {
      setRemoteStreams((prevStreams) => {
        const existingStream = prevStreams.find(
          (stream) => stream.userId === userId
        );
        if (!existingStream) {
          return [...prevStreams, { userId, stream: event.streams[0] }];
        }
        return prevStreams;
      });

      if (!remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId] = React.createRef();
      }

      if (remoteVideoRefs.current[userId].current) {
        remoteVideoRefs.current[userId].current.srcObject = event.streams[0];
      } else {
        console.error(`Ref for user ${userId} is not initialized`);
      }
    };

    return peerConnection;
  };

  // Function to handle join requests
  const handleJoinRequest = (userId, isAccepted) => {
    if (isAccepted) {
      socketRef.current.emit("approve-request", { userId, approved: true });
    } else {
      socketRef.current.emit("approve-request", { userId, approved: false });
    }

    // Remove the request from the joinRequests array
    setJoinRequests((prevRequests) =>
      prevRequests.filter((request) => request.userId !== userId)
    );

    socketRef.current.emit("join-approved", {
      roomName: "live-room",
      userId: userId,
    });
  };

  return (
    // <div className=" bg-gray-900 text-white min-h-screen flex">
    <div className="relative">
      <div className="fixed top-0 left-0 z-20 w-1/5 bg-white text-white h-screen">
        <SideBar auth={getAuth()} setAuth={setAuth} user={getCurrentUser()} />
      </div>{" "}
      <div className="flex flex-grow p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-xl">{userName}</p>
            <p className="text-sm text-gray-400">{userInitial}</p>
          </div>
          <div>
            <button
              className="bg-red-600 px-4 py-2 rounded-md"
              onClick={stopVideo}
            >
              End Call
            </button>
          </div>
        </div>

        {/* local shows on screen */}
        <div className="mt-4 flex">
          <div className="w-[40rem] h-[30rem] border rounded-lg bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full"
            />
          </div>

          <div className="ml-4">
            <img
              src={allowAudio ? Audio : AudioLess}
              alt="Audio Toggle"
              onClick={() => setAllowAudio(!allowAudio)}
              className="w-10 h-10 mb-2 cursor-pointer"
            />
            <img
              src={allowCamera ? Camera : CameraLess}
              alt="Camera Toggle"
              onClick={() => setAllowCamera(!allowCamera)}
              className="w-10 h-10 mb-2 cursor-pointer"
            />
            <img src={SettingBar} alt="Settings" className="w-10 h-10 mb-2" />
            <img src={List} alt="List" className="w-10 h-10 mb-2" />
          </div>

          <span className=" text-gray-700">Users connected: {userCount}</span>
        </div>

        {/* the whole of this does not show onm screen */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {remoteStreams.map(({ userId, stream }) => (
            <div
              key={userId}
              className="w-full h-[15rem] border rounded-lg bg-black"
            >
              <video
                ref={(el) => {
                  if (el) {
                    remoteVideoRefs.current[userId] = el;
                    el.srcObject = stream;
                  } else {
                    console.error(`Failed to set ref for user ${userId}`);
                  }
                }}
                autoPlay
                playsInline
                className="h-full w-full"
              />
            </div>
          ))}

          <div>
            <p>{joinRequests.length}</p>
          </div>
        </div>

        {/* this also does not show on screen */}
        {user?.email === "timothyedibo@gmail.com" &&
          joinRequests.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg">Join Requests:</h2>
              {joinRequests.map((request, index) => (
                <li key={request.userId} className="ml-43 flex justify-between">
                  <div
                    key={index}
                    className="text-white p-2 mb-2 border rounded-lg bg-gray-800"
                  >
                    <p>{request.userName} wants to join</p>
                    <button
                      className="bg-green-600 px-2 py-1 rounded-md mr-2"
                      onClick={() => handleJoinRequest(request.userId, true)}
                    >
                      Allow
                    </button>
                    <button
                      className="bg-red-600 px-2 py-1 rounded-md"
                      onClick={() => handleJoinRequest(request.userId, false)}
                    >
                      Deny
                    </button>
                  </div>
                </li>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default StartLive;
