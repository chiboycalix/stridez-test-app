import React, { useState, useRef, useEffect } from "react";
import Logo from "../../assets/logo.png";
import Live from "../../assets/Live.png";
import Analytics from "../../assets/Analytics.png";
import Calendar from "../../assets/Calendar.png";
import CourseManage from "../../assets/CourseManage.png";
import ExploreFor from "../../assets/ExploreFor.png";
import HorizontalDivider from "../../assets/HorizontalDivider.png";
import Notification from "../../assets/Notification.png";
import Profile from "../../assets/Profile.png";
import UploadVideo from "../../assets/UploadVideo.png";
import Camera from "../../assets/Camera.png";
import CameraLess from "../../assets/CameraLess.png";
import Audio from "../../assets/Audio.png";
import AudioLess from "../../assets/AudioLess.png";
import Talk from "../../assets/talk.png"; // Image for chat button
import WhiteBoard from "../../assets/WhiteBoard.png"; // Image for whiteboard button
import Group from "../../assets/group.png"; // Image for participants button
import Adjust from "../../assets/Adjust.png"; // Image for exit button
import Pupil from "../../assets/Pupil.png";
import "../../styles/StartWebinar.css";

const StartWebinar = () => {
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isWhiteBoardVisible, setIsWhiteBoardVisible] = useState(false);
  // const [participants, setParticipants] = useState(0);
  const [strokes, setStrokes] = useState([]);
  const [texts, setTexts] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [isErasing, setIsErasing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedShape, setSelectedShape] = useState(null);
  // const [textInput, setTextInput] = useState('');
  const [isAddingText, setIsAddingText] = useState(false);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const videoRef = useRef(null);

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const toggleChat = () => setIsChatVisible(!isChatVisible);
  const toggleWhiteBoard = () => setIsWhiteBoardVisible(!isWhiteBoardVisible);
  const toggleEmojiPicker = () => setShowEmojiPicker(!showEmojiPicker);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "black";
      ctxRef.current = ctx;
    }
  }, [isWhiteBoardVisible]);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      strokes.forEach((stroke) => {
        ctx.beginPath();
        ctx.moveTo(stroke.start.x, stroke.start.y);
        ctx.lineTo(stroke.end.x, stroke.end.y);
        ctx.stroke();
        ctx.closePath();
      });
      shapes.forEach((shape) => drawShape(shape.type, shape.x, shape.y, false));
      texts.forEach((text) => {
        ctx.fillText(text.text, text.x, text.y);
      });
    }
  }, [strokes, shapes, texts]);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    if (isErasing) {
      ctxRef.current.clearRect(x - 5, y - 5, 10, 10);
      setTexts(texts.filter((text) => !isWithinBounds(text, x, y)));
      setShapes(shapes.filter((shape) => !isWithinBounds(shape, x, y)));
      setStrokes(
        strokes.filter((stroke) => {
          return !(
            x >= Math.min(stroke.start.x, stroke.end.x) &&
            x <= Math.max(stroke.start.x, stroke.end.x) &&
            y >= Math.min(stroke.start.y, stroke.end.y) &&
            y <= Math.max(stroke.start.y, stroke.end.y)
          );
        })
      );
    } else {
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
      setStrokes((prevStrokes) => [
        ...prevStrokes,
        {
          start: { x, y },
          end: { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
        },
      ]);
    }
  };

  const handleMouseUp = (e) => {
    isDrawing.current = false;
    ctxRef.current.closePath();
  };

  const toggleEraser = () => setIsErasing(!isErasing);

  const handleChatInputChange = (e) => {
    setChatInput(e.target.value);
  };

  const handleSendChat = () => {
    setChatMessages([...chatMessages, chatInput]);
    setChatInput("");
  };

  const handleEmojiClick = (emoji) => {
    setChatInput(chatInput + emoji);
    setShowEmojiPicker(false);
  };

  const handleAddShape = (shape) => {
    setSelectedShape(shape);
  };

  const handleAddText = () => {
    setIsAddingText(true);
  };

  const handleCanvasClick = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (selectedShape) {
      drawShape(selectedShape, x, y, true);
      setSelectedShape(null);
    } else if (isAddingText) {
      const text = prompt("Enter your text:");
      if (text) {
        ctxRef.current.fillText(text, x, y);
        setTexts((prevTexts) => [...prevTexts, { text, x, y }]);
      }
      setIsAddingText(false);
    }
  };

  const drawShape = (shape, x, y, save) => {
    const ctx = ctxRef.current;
    switch (shape) {
      case "rectangle":
        ctx.strokeRect(x, y, 100, 50);
        if (save) {
          setShapes((prevShapes) => [
            ...prevShapes,
            { type: "rectangle", x, y, width: 100, height: 50 },
          ]);
        }
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, 2 * Math.PI);
        ctx.stroke();
        if (save) {
          setShapes((prevShapes) => [
            ...prevShapes,
            { type: "circle", x, y, radius: 50 },
          ]);
        }
        break;
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 50, y + 100);
        ctx.lineTo(x - 50, y + 100);
        ctx.closePath();
        ctx.stroke();
        if (save) {
          setShapes((prevShapes) => [
            ...prevShapes,
            {
              type: "triangle",
              x,
              y,
              points: [
                { x: x + 50, y: y + 100 },
                { x: x - 50, y: y + 100 },
              ],
            },
          ]);
        }
        break;
      default:
        break;
    }
  };

  const isWithinBounds = (item, x, y) => {
    if (item.type === "rectangle") {
      return (
        x >= item.x &&
        x <= item.x + item.width &&
        y >= item.y &&
        y <= item.y + item.height
      );
    } else if (item.type === "circle") {
      return Math.sqrt((x - item.x) ** 2 + (y - item.y) ** 2) <= item.radius;
    } else if (item.type === "triangle") {
      // Basic bounding box check for triangle
      const minX = Math.min(item.x, item.points[0].x, item.points[1].x);
      const maxX = Math.max(item.x, item.points[0].x, item.points[1].x);
      const minY = Math.min(item.y, item.points[0].y, item.points[1].y);
      const maxY = Math.max(item.y, item.points[0].y, item.points[1].y);
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    } else if (item.text) {
      const textWidth = ctxRef.current.measureText(item.text).width;
      const textHeight = 16; // Assume a fixed height for simplicity
      return (
        x >= item.x &&
        x <= item.x + textWidth &&
        y >= item.y - textHeight &&
        y <= item.y
      );
    }
    return false;
  };

  useEffect(() => {
    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };
    startStream();
  }, []);

  return (
    <div>
      <div className="eye">
        <img src={Logo} alt="stridez" />
        <div className="nigga">
          <input type="text" placeholder="Search" className="inside" />
        </div>
        <img src={Notification} alt="Notification" className="noti" />
        <img src={Pupil} alt="Pupil" className="las" />
      </div>
      <div className="pac">
        <div className="ijebu">
          <img src={Live} alt="Live" />
          <img src={UploadVideo} alt="UploadVideo" />
          <img src={Calendar} alt="Calendar" />
          <img src={CourseManage} alt="Course Manage" />
          <img src={Analytics} alt="Analytics" />
          <img src={ExploreFor} alt="Explore For" />
          <img src={Profile} alt="Profile" />
          <img src={HorizontalDivider} alt="Horizontal Divider" />
        </div>

        <div className="webinar-container">
          <div className="webinar-content">
            {isWhiteBoardVisible && (
              <div className="whiteboard">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={500}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onClick={handleCanvasClick}
                  className={`whiteboard-canvas ${
                    isErasing ? "eraser-cursor" : "pen-cursor"
                  }`}
                />
                <div className="whiteboard-controls">
                  <button className="webinar-button" onClick={toggleEraser}>
                    {isErasing ? "Switch to Pen" : "Switch to Eraser"}
                  </button>
                  <button
                    className="webinar-button"
                    onClick={() => handleAddShape("rectangle")}
                  >
                    Add Rectangle
                  </button>
                  <button
                    className="webinar-button"
                    onClick={() => handleAddShape("circle")}
                  >
                    Add Circle
                  </button>
                  <button
                    className="webinar-button"
                    onClick={() => handleAddShape("triangle")}
                  >
                    Add Triangle
                  </button>
                  <button className="webinar-button" onClick={handleAddText}>
                    Add Text
                  </button>
                </div>
              </div>
            )}
            <div className="video-chat">
              <div className="video">
                <video ref={videoRef} autoPlay muted></video>
                {!isCameraOn && <p>Camera is off</p>}
              </div>
              {isChatVisible && (
                <div className="chat">
                  <div className="chat-messages">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className="chat-message">
                        {msg}
                      </div>
                    ))}
                  </div>
                  <div className="chat-input-container">
                    <textarea
                      className="chat-textarea"
                      value={chatInput}
                      onChange={handleChatInputChange}
                      placeholder="Type your message..."
                    ></textarea>
                    <div className="chat-buttons">
                      <button
                        className="webinar-button"
                        onClick={handleSendChat}
                      >
                        Send
                      </button>
                      <button
                        className="webinar-button"
                        onClick={toggleEmojiPicker}
                      >
                        Emoji
                      </button>
                    </div>
                    {showEmojiPicker && (
                      <div className="emoji-picker">
                        <span onClick={() => handleEmojiClick("😊")}>😊</span>
                        <span onClick={() => handleEmojiClick("😂")}>😂</span>
                        <span onClick={() => handleEmojiClick("😍")}>😍</span>
                        <span onClick={() => handleEmojiClick("😢")}>😢</span>
                        <span onClick={() => handleEmojiClick("👍")}>👍</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="webinar-controls">
            <button className="webinar-button" onClick={toggleMicrophone}>
              <img
                src={isMicrophoneEnabled ? Audio : AudioLess}
                alt={isMicrophoneEnabled ? "Mute Audio" : "Unmute Audio"}
                className="audio"
              />
            </button>
            <button className="webinar-button" onClick={toggleCamera}>
              <img
                src={isCameraOn ? Camera : CameraLess}
                alt={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
                className="camera"
              />
            </button>
            <button className="webinar-button" onClick={toggleChat}>
              <img src={Talk} alt="Chat" />
            </button>
            <button className="webinar-button" onClick={toggleWhiteBoard}>
              <img src={WhiteBoard} alt="Whiteboard" className="white" />
            </button>
            <button className="webinar-button">
              <img src={Group} alt="Participants" />
            </button>
            <button className="webinar-button">
              <img src={Adjust} alt="Exit" className="adjust" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartWebinar;
