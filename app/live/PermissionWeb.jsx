import React, { useState } from "react";
import '../../styles/LiveUpdate.css';
import Logo from '../../assets/logo.png';
import Live from '../../assets/Live.png';
import AuthIcons from '../../assets/AuthIcons.png';
import Analytics from '../../assets/Analytics.png';
import Calendar from '../../assets/Calendar.png';
import CourseManage from '../../assets/CourseManage.png';
import ExploreFor from '../../assets/ExploreFor.png';
import HorizontalDivider from '../../assets/HorizontalDivider.png';
import Notification from '../../assets/Notification.png';
import Profile from '../../assets/Profile.png';
import UploadVideo from '../../assets/UploadVideo.png';
import { useNavigate } from "react-router-dom";

const PermissionWeb = () => {
  const [activeMode, setActiveMode] = useState('live');
  const [showGoLiveBox, setShowGoLiveBox] = useState(true);
  const navigate = useNavigate();

  const handleLive = () => {
    navigate('/ScheduleForm');
    console.log('Schedule');
  };

  const Muted = () => {
    navigate('/MutedWeb');
    console.log('Schedule');
  };

  const handleDismiss = () => {
    setShowGoLiveBox(false);
  };

  return (
    <div>
      <div className='head'>
        <img src={Logo} alt="Logo" />
        <div className='input-container'>
          <input placeholder="search" className="pray" />
          <img src={AuthIcons} alt="Auth Icons" />
        </div>
        <img src={Notification} alt="Notification" />
      </div>
      <div className="state">
        <div className="part">
          <img src={Live} alt="Live" />
          <img src={UploadVideo} alt="UploadVideo" />
          <img src={Calendar} alt="Calendar" />
          <img src={CourseManage} alt="Course Manage" />
          <img src={Analytics} alt="Analytics" />
          <img src={ExploreFor} alt="Explore For" />
          <img src={Profile} alt="Profile" />
          <img src={HorizontalDivider} alt="Horizontal Divider" />
        </div>
        <div className="schedule">
          <div className="container">
            <div className="md:col-span-3 grid grid-cols rounded bg-gray-50 gap-4 pl-10">
              <div className="min-h-screen flex flex-col justify-center items-center gap-y-4 pt-10">
                <div className="flex flex-col items-center">
                  <h1 className='pro'>Get Started</h1>
                  <h3 className="east">Setup your audio and video before going live</h3>
                </div>

                <button className="mt-4 py-2 px-4 bg-blue-500 text-white rounded">You are the first to join</button>

                <div className="flex mt-10 space-x-4">
                  <button className="py-2 px-4 bg-gray-200 rounded"><img src={Live} alt="Live Icon" /></button>
                  <button className="py-2 px-4 bg-gray-200 rounded"><img src={UploadVideo} alt="Upload Icon" /></button>
                  <button className="py-2 px-4 bg-gray-200 rounded ml-12"><img src={Calendar} alt="Calendar Icon" /></button>
                </div>

                <div className="flex mt-6 space-x-4">
                  <button className="py-2 px-4 bg-green-500 text-white rounded">Ore Aisha</button>
                  <button className="py-2 px-4 bg-green-500 text-white rounded">Go Live</button>
                </div>

                {showGoLiveBox && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
                    <div className="bg-[#03011A] p-8 rounded-lg shadow-lg text-center" style={{ height: '240px', width: '380px', borderRadius: '12px', position: 'relative' }}>
                      <h1 className="text-2xl mb-2 text-white">
                      Allow to use your microphone and camera</h1>
                      <h3 className="mb-4 text-gray-300">
                      Access to Microphone and Camera is required. Enable permissions for Microphone and Camera by clicking “Allow” on the pop-up.</h3>
                      <div className="absolute bottom-4 right-4 flex space-x-2">
                        <button className="py-2 px-4 bg-black text-white border border-white rounded" onClick={handleDismiss}>Dismiss</button>
                        <button onClick={Muted} className="py-2 px-4 bg-[#37169C] text-white rounded">Allow</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionWeb;
