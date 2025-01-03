"use client"

import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  FormEvent,
} from "react";
import Socket from "@/components/Socket";
import { useAuth } from "@/context/AuthContext";
import { BsX } from "react-icons/bs";
import Toastify from "@/components/Toastify";
import Link from "next/link";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/utils/constant";

export default function ProfileSetup() {
  const { getAuth, getCurrentUser, setAuth } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [username, setUsername] = useState<string>("");
  const [alert, setAlert] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Trigger file input for profile image
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Handle profile image upload and preview
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload the image to Cloudinary
  const uploadImage = async (avatar: File): Promise<string | undefined> => {
    try {
      const data = new FormData();
      data.append("file", avatar);
      data.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string
      );
      data.append(
        "cloud_name",
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string
      );
      data.append("folder", "Stridez/profile-images");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: "POST", body: data }
      );

      if (!response.ok) throw new Error("Failed to upload image");

      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error("Image upload error:", error);
      setAlert("Failed to upload image");
    }
  };

  // Handle profile update submission
  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const avatarUrl = image ? await uploadImage(image) : undefined;

    const requestPayload = {
      firstName,
      lastName,
      username,
      bio,
      avatar: avatarUrl,
    };

    try {
      const response = await fetch(`${baseUrl}/profiles`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        setAlert(result.message);
      } else {
        setAlert("Profile updated successfully!");
        setAuth(true, result.data);
        router.push("/auth/interest");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setAlert("Failed to update profile");
      setLoading(false);
    }
  };

  // Effect to check user authentication and redirect
  useEffect(() => {
    const user = getCurrentUser();
    console.log("user..........", user)
    if (!getAuth()) router.push("/auth");
    if (user?.profileSetupCompleted) router.push("/");
  }, [getAuth, getCurrentUser, router]);

  return (
    <>
      <Toastify message={alert} />
      <button
        onClick={() => router.push("/")}
        className="fixed top-7 right-7 p-1.5 bg-slate-100 rounded-full"
      >
        <BsX className="text-xl" />
      </button>
      <div className="flex flex-col lg:flex-row max-h-screen p-3 lg:gap-20 bg-white rounded-lg">
        {/* Profile Setup Header */}
        <div className="w-full lg:w-5/12 relative">
          <img
            src={"assets/profilepix.png"}
            alt="Profile Setup"
            className="w-full h-64 lg:h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black to-transparent rounded-b-lg">
            <h2 className="text-white text-3xl font-medium">
              Set up your profile
            </h2>
          </div>
        </div>

        {/* Profile Setup Form */}
        <div
          className="w-full px-4 lg:px-16 flex-1 flex justify-center rounded-lg overflow-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="max-w-[40rem] py-3">
            <h2 className="text-3xl font-semibold my-4">Set up your profile</h2>

            <form onSubmit={handleUpdateProfile}>
              {/* Avatar Upload */}
              <div className="mb-2">
                <label className="block text-gray-700 text-sm font-medium">
                  Avatar
                </label>
                <div className="flex items-center gap-3 py-3">
                  <img
                    src={profileImage || "/assets/userpix.png"}
                    alt="Profile"
                    className="w-20 h-20 rounded-full bg-blue-200"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <div>
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="border border-gray-200 text-sm bg-transparent hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
                    >
                      Upload new image
                    </button>
                    <p className="text-gray-500 text-xs mt-2">
                      Recommended: 800x800 px. Formats: JPG, PNG, GIF.
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-sm border rounded py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Create your username"
                />
                {username && <Socket username={username} />}
              </div>

              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Firstname
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full text-sm border rounded py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Firstname"
                />
              </div>

              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Lastname
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full text-sm border rounded py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Lastname"
                />
              </div>

              {/* Bio Field */}
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-sm border rounded py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Short bio"
                />
              </div>

              {/* Submit and Skip Buttons */}
              <div className="flex flex-col items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#37169C] hover:bg-[#37169C]/85 text-white font-medium py-2.5 text-sm px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {loading ? <Spinner /> : "Save and Continue"}
                </button>
                <button className="w-full mt-3 text-gray-500 text-sm border-1 border-slate-800 py-2.5 hover:bg-gray-200 rounded-sm">
                  <Link href={"/"}>Skip to do these later</Link>
                </button>{" "}
              </div>
            </form>

            {/* Skip Info */}
            <p className="w-full text-gray-500 text-xs mt-2 text-center lg:text-left mb-6">
              You can skip this process now and complete your profile setup
              later in the profile settings.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
