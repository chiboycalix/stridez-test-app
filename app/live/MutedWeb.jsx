import React, { useState } from 'react'
import '../../styles/LiveUpdate.css'
import '../../styles/Muted.css'
import Live from '../../assets/Live.png'
import AuthIcons from '../../assets/AuthIcons.png'
import Analytics from '../../assets/Analytics.png'
import Calendar from '../../assets/Calendar.png'
import CourseManage from '../../assets/CourseManage.png'
import ExploreFor from '../../assets/ExploreFor.png'
import HorizontalDivider from '../../assets/HorizontalDivider.png'
import Notification from '../../assets/Notification.png'
import Profile from '../../assets/Profile.png'
import UploadVideo from '../../assets/UploadVideo.png'
import Chip from '../../assets/Chip.png'
import VideoTile from '../../assets/VideoTile.png'
import Audio from '../../assets/Audio.png'
import AudioLess from '../../assets/AudioLess.png'
import Camera from '../../assets/Camera.png'
import CameraLess from '../../assets/CameraLess.png'
import SettingBar from '../../assets/SettingBar.png'
import List from '../../assets/List.png'
import { useNavigate } from 'react-router-dom'
import StartLive from './StartLive'

const MutedWeb = () => {
  const [activeMode, setActiveMode] = useState('live')
  const [showGoLiveBox, setShowGoLiveBox] = useState(true)
  const [imageToggled1, setImageToggled1] = useState(false)
  const [imageToggled2, setImageToggled2] = useState(false)
  const [showBeneathImage, setShowBeneathImage] = useState(false)

  const navigate = useNavigate()

  const StartLive = () => {
    navigate('/StartWebinar')
    console.log('Schedule')
  }

  const handleDismiss = () => {
    setShowGoLiveBox(false)
  }

  const toggleImage1 = () => {
    setImageToggled1(!imageToggled1)
    setShowBeneathImage(!showBeneathImage)
  }

  const toggleImage2 = () => {
    setImageToggled2(!imageToggled2)
    if (imageToggled1 && !imageToggled2) {
      setShowBeneathImage(true)
    } else {
      setShowBeneathImage(false)
    }
  }

  return (
    <div>
      <div className="head">
        <img src={'/assets/logo.png'} alt="Logo" />
        <div className="input-container">
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
              <div className="min-h-screen flex flex-col justify-center items-center gap-y-4 pt-4">
                <div className="flex flex-col items-center">
                  <h1 className="pro">Get Started</h1>
                  <h3 className="east">
                    Setup your audio and video before going live
                  </h3>
                </div>
                <div className="flex flex-col items-center space-y-4 mt-6">
                  <img src={Chip} alt="Chip" />
                  <img src={VideoTile} alt="Video Tile" />
                </div>
                <div className="flex mt-6 space-x-4">
                  <button onClick={toggleImage1}>
                    <img
                      src={imageToggled1 ? Audio : AudioLess}
                      alt="Toggle Image 1"
                    />
                  </button>
                  <button onClick={toggleImage2}>
                    <img
                      src={imageToggled2 ? Camera : CameraLess}
                      alt="Toggle Image 2"
                    />
                  </button>
                  <button>
                    <img
                      src={SettingBar}
                      alt="Setting Bar"
                      className=" recite"
                    />
                  </button>
                </div>
                {showBeneathImage && (
                  <div className="mt-4">
                    <img src={List} alt="Beneath Image" />
                  </div>
                )}
                <div className="flex mt-6 space-x-4 w-full justify-center">
                  <button className="Ore  p-2">Ore Aisha</button>
                  <button onClick={StartLive} className="Aisha text-white p-2">
                    Go Live
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MutedWeb
