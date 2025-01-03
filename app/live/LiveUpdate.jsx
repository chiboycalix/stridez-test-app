// import React from "react";
// import "../../styles/LiveUpdate.css";
// import Logo from "../../assets/icons/logo.png";
// import Live from "../../assets/icons/Live.png";

// import Analytics from "../../assets/icons/Analytics.png";
// import Calendar from "../../assets/icons/Calendar.png";
// import CourseManage from "../../assets/icons/CourseManage.png";
// import ExploreFor from "../../assets/icons/ExploreFor.png";
// import HorizontalDivider from "../../assets/icons/HorizontalDivider.png";
// import Notification from "../../assets/icons/Notification.png";
// import Profile from "../../assets/icons/Profile.png";
// import UploadVideo from "../../assets/icons/UploadVideo.png";
// import Input from "../../assets/icons/Input.png";
// import { useNavigate } from "react-router-dom";

// const LiveUpdate = () => {
//   const navigate = useNavigate();
//   const handleLive = () => {
//     navigate("/ScheduleForm");
//     console.log("Schedule");
//   };

//   const startLive = () => {
//     navigate("/StartLive");
//     console.log("Schedule");
//   };

//   return (
//     <div>
//       <div className="head">
//         <img src={Logo} alt="Logo" />
//         <div className="input-container">
//           <input placeholder="search" className="pray" />
//         </div>
//         <img src={Notification} alt="Notification" />
//       </div>
//       <div className="state">
//         <div className="part">
//           <img src={Live} alt="Live" />
//           <img src={UploadVideo} alt="UploadVideo" />
//           <img src={Calendar} alt="Calendar" />
//           <img src={CourseManage} alt="Course Manage" />
//           <img src={Analytics} alt="Analytics" />
//           <img src={ExploreFor} alt="Explore For" />
//           <img src={Profile} alt="Profile" />
//           <img src={HorizontalDivider} alt="Horizontal Divider" />
//         </div>
//         <div className="">
//           <div className="my-6">
//             <h1>Please select the purpose of the live Session</h1>
//             <h3>Are you starting an instant meeting or scheduling one?</h3>
//           </div>
//           <button onClick={startLive}>
//             Start an instant webinar
//             {/* <img src={Instant} alt="Instant" /> */}
//           </button>
//           <button onClick={handleLive}>
//             <img src={Input} alt="Input" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LiveUpdate;
