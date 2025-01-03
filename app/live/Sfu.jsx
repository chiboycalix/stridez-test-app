import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";

const Room = () => {
  const roomName = window.location.pathname.split("/")[2];

  const [socket] = useState(() => io("/mediasoup"));
  const [device, setDevice] = useState(null);
  const [rtpCapabilities, setRtpCapabilities] = useState(null);
  const [producerTransport, setProducerTransport] = useState(null);
  const [consumerTransports, setConsumerTransports] = useState([]);
  const [audioProducer, setAudioProducer] = useState(null);
  const [videoProducer, setVideoProducer] = useState(null);
  const [consumingTransports, setConsumingTransports] = useState([]);

  const localVideoRef = useRef(null);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    socket.on("connection-success", ({ socketId }) => {
      console.log(socketId);
      getLocalStream();
    });

    socket.on("new-producer", ({ producerId }) =>
      signalNewConsumerTransport(producerId)
    );
    socket.on("producer-closed", ({ remoteProducerId }) =>
      handleProducerClosed(remoteProducerId)
    );

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const getLocalStream = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          width: { min: 640, max: 1920 },
          height: { min: 400, max: 1080 },
        },
      })
      .then(streamSuccess)
      .catch((error) => console.log(error.message));
  };

  const streamSuccess = (stream) => {
    localVideoRef.current.srcObject = stream;

    const audioParams = { track: stream.getAudioTracks()[0] };
    const videoParams = {
      track: stream.getVideoTracks()[0],
      encodings: [
        { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
        { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
        { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
      ],
      codecOptions: { videoGoogleStartBitrate: 1000 },
    };

    joinRoom(audioParams, videoParams);
  };

  const joinRoom = (audioParams, videoParams) => {
    socket.emit("joinRoom", { roomName }, async (data) => {
      console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`);
      setRtpCapabilities(data.rtpCapabilities);

      const device = await createDevice(data.rtpCapabilities);
      setDevice(device);

      const producerTransport = await createSendTransport(device);
      setProducerTransport(producerTransport);

      await connectSendTransport(producerTransport, audioParams, videoParams);
    });
  };

  const createDevice = async (rtpCapabilities) => {
    const device = new mediasoupClient.Device();
    await device.load({ routerRtpCapabilities: rtpCapabilities });
    console.log("Device RTP Capabilities", device.rtpCapabilities);
    return device;
  };

  const createSendTransport = async (device) => {
    return new Promise((resolve) => {
      socket.emit(
        "createWebRtcTransport",
        { consumer: false },
        ({ params }) => {
          if (params.error) {
            console.log(params.error);
            return;
          }
          console.log(params);
          const producerTransport = device.createSendTransport(params);
          handleTransportEvents(producerTransport, false);
          resolve(producerTransport);
        }
      );
    });
  };

  const handleTransportEvents = (transport, isConsumer) => {
    transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
      try {
        await socket.emit("transport-connect", { dtlsParameters });
        callback();
      } catch (error) {
        errback(error);
      }
    });

    if (!isConsumer) {
      transport.on("produce", async (parameters, callback, errback) => {
        try {
          await socket.emit(
            "transport-produce",
            {
              kind: parameters.kind,
              rtpParameters: parameters.rtpParameters,
              appData: parameters.appData,
            },
            ({ id, producersExist }) => {
              callback({ id });
              if (producersExist) getProducers();
            }
          );
        } catch (error) {
          errback(error);
        }
      });
    }
  };

  const connectSendTransport = async (transport, audioParams, videoParams) => {
    const audioProducer = await transport.produce(audioParams);
    const videoProducer = await transport.produce(videoParams);

    handleProducerEvents(audioProducer, "audio");
    handleProducerEvents(videoProducer, "video");

    setAudioProducer(audioProducer);
    setVideoProducer(videoProducer);
  };

  const handleProducerEvents = (producer, kind) => {
    producer.on("trackended", () => {
      console.log(`${kind} track ended`);
    });

    producer.on("transportclose", () => {
      console.log(`${kind} transport ended`);
    });
  };

  const signalNewConsumerTransport = async (remoteProducerId) => {
    if (consumingTransports.includes(remoteProducerId)) return;
    setConsumingTransports([...consumingTransports, remoteProducerId]);

    socket.emit("createWebRtcTransport", { consumer: true }, ({ params }) => {
      if (params.error) {
        console.log(params.error);
        return;
      }

      let consumerTransport;
      try {
        consumerTransport = device.createRecvTransport(params);
      } catch (error) {
        console.log(error);
        return;
      }

      handleTransportEvents(consumerTransport, true);
      connectRecvTransport(consumerTransport, remoteProducerId, params.id);
    });
  };

  const connectRecvTransport = async (
    consumerTransport,
    remoteProducerId,
    serverConsumerTransportId
  ) => {
    socket.emit(
      "consume",
      {
        rtpCapabilities: device.rtpCapabilities,
        remoteProducerId,
        serverConsumerTransportId,
      },
      async ({ params }) => {
        if (params.error) {
          console.log("Cannot Consume");
          return;
        }

        const consumer = await consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });

        setConsumerTransports([
          ...consumerTransports,
          {
            consumerTransport,
            serverConsumerTransportId: params.id,
            producerId: remoteProducerId,
            consumer,
          },
        ]);

        const newElem = document.createElement("div");
        newElem.setAttribute("id", `td-${remoteProducerId}`);
        newElem.className = params.kind === "audio" ? "" : "remoteVideo";
        newElem.innerHTML =
          params.kind === "audio"
            ? `<audio id="${remoteProducerId}" autoplay></audio>`
            : `<video id="${remoteProducerId}" autoplay class="video"></video>`;

        videoContainerRef.current.appendChild(newElem);
        document.getElementById(remoteProducerId).srcObject = new MediaStream([
          consumer.track,
        ]);

        socket.emit("consumer-resume", {
          serverConsumerId: params.serverConsumerId,
        });
      }
    );
  };

  const getProducers = () => {
    socket.emit("getProducers", (producerIds) => {
      producerIds.forEach(signalNewConsumerTransport);
    });
  };

  const handleProducerClosed = (remoteProducerId) => {
    const producerToClose = consumerTransports.find(
      (transportData) => transportData.producerId === remoteProducerId
    );
    producerToClose.consumerTransport.close();
    producerToClose.consumer.close();

    setConsumerTransports(
      consumerTransports.filter(
        (transportData) => transportData.producerId !== remoteProducerId
      )
    );

    const videoContainer = videoContainerRef.current;
    videoContainer.removeChild(
      document.getElementById(`td-${remoteProducerId}`)
    );
  };

  return (
    <div>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        style={{ width: "500px", height: "300px" }}
      />
      <div ref={videoContainerRef}></div>
    </div>
  );
};

export default Room;
