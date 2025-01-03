// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { useAuth } from "../../Providers/AuthProvider";
// import Socket from "../../../../components/Socket.jsx";
// import { AnimatePresence, motion } from "framer-motion";
// import { X } from "lucide-react";
// import Image from "next/image";

// const EditUserInputModal = ({ userProfile, onClose }) => {
//   const { getCurrentUser, setAuth } = useAuth();

//   // Fetch user data from the server
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);
//   const [open, setOpen] = useState(true);
//   const [success, setSuccess] = useState(false);

//   // Local state for form inputs
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [username, setUsername] = useState("");
//   const [bio, setBio] = useState("");
//   const [selectedImage, setSelectedImage] = useState(null); // State for selected image
//   const [imagePreview, setImagePreview] = useState(null); // State for image preview
//   const [imgPrev, setImgPrev] = useState(null);

//   const fileInputRef = useRef(null);
//   const baseUrl = process.env.REACT_APP_BASEURL;

//   // Image change handler to preview image before uploading
//   const handleImageChange = async (e) => {
//     const file = await e?.target.files[0];

//     setSelectedImage(file); // Store the selected image
//     setImgPrev(URL.createObjectURL(file));
//     // Generate preview URL
//     const reader = new FileReader();
//     console.log("reader", reader);
//     reader.onloadend = () => {
//       setImagePreview(reader.result);
//     };
//     if (file) {
//       console.log(reader.readAsDataURL(file)); // Convert image to base64 string for preview
//     }
//   };

//   // Trigger file input for profile image
//   const handleImageClick = () => {
//     fileInputRef.current.click();
//   };

//   const fetchUser = useCallback(async () => {
//     try {
//       const userData = userProfile;
//       setUser(userProfile);

//       // Initialize the form values with the user data
//       setFirstName(userData?.profile?.firstName || "");
//       setLastName(userData?.profile?.lastName || "");
//       setUsername(userData?.username || "");
//       setBio(userData?.profile?.bio || "");
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//       setError(true);
//     }
//   }, [userProfile]);

//   useEffect(() => {
//     fetchUser();

//     // Close modal on Escape key press
//     const handleEsc = (event) => {
//       if (event.key === "Escape") {
//         setOpen(false);
//         if (onClose) onClose();
//       }
//     };

//     window.addEventListener("keydown", handleEsc);
//     return () => {
//       window.removeEventListener("keydown", handleEsc);
//     };
//   }, [fetchUser, onClose]);

//   // Handle image upload to Cloudinary
//   const uploadImageToCloudinary = async (file) => {
//     const data = new FormData();
//     data.append("file", file);
//     data.append(
//       "upload_preset",
//       process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
//     );
//     data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
//     data.append("folder", "Stridez/profiles");

//     try {
//       const response = await fetch(
//         `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`,
//         {
//           method: "POST",
//           body: data,
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to upload image");
//       }

//       const responseData = await response.json();

//       return responseData.secure_url;
//     } catch (error) {
//       console.error("Error uploading image to Cloudinary:", error);
//       throw error;
//     }
//   };

//   const handleUpdateUser = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       let imageUrl = user?.profile?.avatar;

//       if (selectedImage) {
//         const profileImage = localStorage.getItem("profileImage");
//         const finalImage = profileImage ? profileImage : selectedImage;
//         imageUrl = await uploadImageToCloudinary(finalImage);
//       }
//       const updatedUserData = {
//         avatar: imageUrl,
//         firstName,
//         lastName,
//         username,
//         bio,
//       };

//       const response = await fetch(`${baseUrl}/profiles`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//         },
//         body: JSON.stringify(updatedUserData),
//       });

//       if (!response.ok) {
//         console.error("Error updating user data");
//         return;
//       }

//       const updatedData = await response.json();
//       setAuth(true, updatedData.data);
//       setSuccess(true);
//       setLoading(false);
//       setOpen(false);
//     } catch (error) {
//       console.error("Error updating user data:", error);
//     }
//   };

//   return (
//     <>
//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center"
//             onClick={() => {
//               setOpen(false);
//               if (onClose) onClose();
//             }}
//           >
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className="bg-white p-6 rounded-xl shadow-lg relative w-full max-w-md"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <button
//                 onClick={() => {
//                   setOpen(false);
//                   if (onClose) onClose();
//                 }}
//                 className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//               >
//                 <X size={24} />
//               </button>
//               <h3 className="text-lg font-medium text-gray-900 mb-4">
//                 Edit Profile
//               </h3>
//               <form onSubmit={handleUpdateUser} className="space-y-4">
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700">
//                     Avatar
//                   </label>
//                   <div className="flex items-center gap-3 mt-2">
//                     <Image
//                     width={80}
//                     height={80}
//                       src={imagePreview || user?.profile?.avatar || ""}
//                       alt="Profile Preview"
//                       className="w-20 h-20 rounded-full object-cover"
//                     />
//                     <input
//                       type="file"
//                       accept="image/*"
//                       ref={fileInputRef}
//                       className="hidden"
//                       onChange={handleImageChange}
//                     />
//                     <div className="">
//                       <button
//                         type="button"
//                         onClick={handleImageClick}
//                         className="px-3 py-1.5 border rounded text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Upload Image
//                       </button>
//                       <p className="text-gray-500 text-[10px] mt-1.5 max-w-xs">
//                         Recommended: 800x800 px. Formats: <br /> JPG, PNG, GIF.
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700">
//                     First Name
//                   </label>
//                   <input
//                     type="text"
//                     value={firstName}
//                     onChange={(e) => setFirstName(e.target.value)}
//                     className="w-full px-3 py-2 border rounded focus:outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700">
//                     Last Name
//                   </label>
//                   <input
//                     type="text"
//                     value={lastName}
//                     onChange={(e) => setLastName(e.target.value)}
//                     className="w-full px-3 py-2 border rounded focus:outline-none"
//                   />
//                 </div>

//                 <div className="flex flex-col">
//                   <label
//                     htmlFor="username"
//                     className="block text-gray-700 text-sm font-medium"
//                   >
//                     Username
//                   </label>
//                   <input
//                     type="text"
//                     name="username"
//                     placeholder="Username"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                     className="flex items-center gap-3 w-full text-sm border rounded py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                   />
//                   {username && <Socket username={username} />}
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700">
//                     Bio
//                   </label>
//                   <textarea
//                     value={bio}
//                     onChange={(e) => setBio(e.target.value)}
//                     className="w-full px-3 py-2 border rounded focus:outline-none"
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   className="w-full py-2 bg-primary text-white rounded hover:bg-primary/85 focus:outline-none"
//                   disabled={loading}
//                 >
//                   {loading ? "Updating..." : "Save Changes"}
//                 </button>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default EditUserInputModal;


import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Socket from "../../../../components/Socket";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

interface UserProfile {
  id: number;
  username: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar: string;
    bio: string;
  };
}

interface EditUserInputModalProps {
  userProfile: UserProfile & { profile?: UserProfile["profile"] };  
  onClose?: () => void;
}

const EditUserInputModal: React.FC<EditUserInputModalProps> = ({
  userProfile,
  onClose,
}) => {
  const { setAuth } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(false);
  const [open, setOpen] = useState(true);
  // const [success, setSuccess] = useState(false);

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASEURL;
  const cloudinaryPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const fetchUser = useCallback(() => {
    setUser(userProfile);
    setFirstName(userProfile.profile.firstName || "");
    setLastName(userProfile.profile.lastName || "");
    setUsername(userProfile.username || "");
    setBio(userProfile.profile.bio || "");
    setLoading(false);
  }, [userProfile]);

  useEffect(() => {
    fetchUser();

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [fetchUser, onClose]);

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryPreset || "");
    formData.append("cloud_name", cloudinaryCloudName || "");
    formData.append("folder", "Stridez/profiles");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = user?.profile.avatar;

      if (selectedImage) {
        imageUrl = await uploadImageToCloudinary(selectedImage);
      }

      const updatedUserData = {
        avatar: imageUrl,
        firstName,
        lastName,
        username,
        bio,
      };

      const response = await fetch(`${baseUrl}/profiles`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(updatedUserData),
      });

      if (!response.ok) {
        console.error("Error updating user data");
        return;
      }

      const updatedData = await response.json();
      setAuth(true, updatedData.data);
      // setSuccess(true);
      setLoading(false);
      setOpen(false);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={() => {
            setOpen(false);
            onClose?.();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-6 rounded-xl shadow-lg relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setOpen(false);
                onClose?.();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Profile
            </h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Avatar
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <Image
                    width={80}
                    height={80}
                    src={imagePreview || user?.profile.avatar || ""}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div>
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="px-3 py-1.5 border rounded text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Upload Image
                    </button>
                    <p className="text-gray-500 text-[10px] mt-1.5 max-w-xs">
                      Recommended: 800x800 px. Formats: JPG, PNG, GIF.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none"
                />
                {username && <Socket username={username} />}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary text-white rounded hover:bg-primary/85 focus:outline-none"
                disabled={loading}
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditUserInputModal;
