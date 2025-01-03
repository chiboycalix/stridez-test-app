import { useEffect, useState, useCallback, useRef } from "react";
import "../../styles/UploadVideo.css";

import Navbar from "./Navbar";
import SideBar from "./SideBar";
import Dropdown from "./Dropdown";
import { useNavigate } from "react-router-dom";
import MediaIcon from "../../assets/icons/media.svg";
import Toastify from "../../components/Toastify";
import Spinner from "../../components/Spinner";
import { useAuth } from "../../Providers/AuthProvider";

const UploadPost = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { auth, setAuth, getCurrentUser, getAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(false);
  const [file, setFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState(null);
  const [postTag, setPostTag] = useState("Sample");
  const [deviceId, setDeviceId] = useState(null);
  const [tags, setTags] = useState("");
  const [fileType, setFileType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const baseUrl = process.env.REACT_APP_BASEURL;
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
      setFile(file);
      setFileType(file.type.startsWith("video") ? "video" : "image");
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = useCallback(async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.log("Geolocation not supported");
    }
  }, []);

  function error() {
    console.log("Unable to retrieve your location");
  }

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    setLocation({ latitude, longitude });
  }

  const handleGetDeviceId = async () => {
    const res = await fetch("https://api.ipify.org/?format=json");
    const data = await res.json();
    if (res.ok) {
      setDeviceId(data.ip);
    }
  };

  const uploadImage = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append(
        "upload_preset",
        process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
      );
      data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
      data.append("folder", "Stridez/posts");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const responseData = await response.json();
      //   Now you can proceed with sending other data to your backend
      const requestBody = {
        mediaUrl: responseData.secure_url,
        title: caption,
        body: tags,
        thumbnailUrl: responseData.secure_url,
        location: JSON.stringify(location),
        deviceId: deviceId,
        tags: postTag,
        media: [
          {
            url: responseData.secure_url,
            title: caption,
            description: tags,
            mimeType: "txt/img"
          }
        ]
      };

      const postResponse = await fetch(`${baseUrl}/posts`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!postResponse.ok) {
        throw new Error("Failed to create post");
      }

      const postData = await postResponse.json();
      console.log("Post created:", postData);
      setAlert(postData.data.message);
      navigate("/");
    } catch (error) {
      console.error("Error uploading image:", error);
      setAlert("Failed to upload");
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    setUser(getCurrentUser());
    handleGetLocation();
    handleGetDeviceId();
  }, [auth, getCurrentUser, handleGetLocation]);

  return (
    <>
        <div className="flex flex-col w-full">
              <div className="relative min-h-screen flex flex-col justify-center items-center gap-y-4 pt-10">
                <button
                  onClick={() => setShowModal(true)}
                  className="p-2 bg-purple-600 text-white rounded-lg"
                >
                  Create Post
                </button>
                
              </div>
          </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="w-[52rem] max-w-[90%] bg-white rounded-lg flex gap-y-4  items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className=" rounded-lg items-center flex flex-col gap-y-4 p-4">
              <div className="text-2xl w-full inline-flex justify-center items-center font-bold pb-3 ">
                <p className="">Create Posts</p>
              </div>
              <div className="flex flex-row justify-center items-center w-full">
                <div
                  className="relative flex justify-center items-center w-[18rem] h-[24rem] rounded-lg mr-4 bg-white cursor-pointer border-2"
                  // onClick={handleFileClick}
                >
                  {mediaPreview ? (
                    fileType === "image" ? (
                      <img
                        src={mediaPreview}
                        alt="Display"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={mediaPreview}
                        controls
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )
                  ) : (
                    <div className="flex flex-col justify-center items-center gap-y-2">
                      <img
                        src={MediaIcon}
                        alt="Display"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="px-6 text-center">
                        <p className="text-gray-500 ">
                          Drag and Drop video and
                        </p>
                        <p className="text-gray-500 ">photo here to upload.</p>
                      </div>

                      <div
                        onClick={handleFileClick}
                        className="border border-gray-200 w-full bg-blue-800 hover:bg-purple-900 text-white py-2 px-4 rounded"
                      >
                        Select from your computer
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative w-[28rem] flex-col justify-center items-center  h-[24rem] rounded-lg mr-4 bg-white border-2 px-4">
                  <div className="space-y-1">
                    <div className="flex justify-start space-x-3 items-center p-2 rounded-lg ">
                      <img
                        src={user.avatar}
                        alt="Display"
                        className="w-14 h-14 object-cover rounded-full border"
                      />
                      <p>
                        {user.firstName} {user.lastName}
                      </p>
                    </div>

                    <input
                      placeholder="Write a caption"
                      type="textfield"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="h-40 w-full bg-[F8F8FC] text-start  px-4 rounded-lg"
                    />

                    <label>Add tags</label>
                    <input
                      placeholder="#IamADesigner"
                      type="textfield"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className=" w-full bg-[F8F8FC] text-start rounded-lg"
                    />

                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      ref={fileInputRef}
                      id="mediaInput"
                    />

                    <button
                      onClick={uploadImage}
                      className="border border-gray-200 w-full bg-purple-600 hover:bg-purple-900 text-white py-2 px-4 rounded"
                    >
                      {loading ? (
                        <Spinner className={"text-white"} />
                      ) : (
                        "Upload"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>)}
    </>
  );
};

export default UploadPost;
