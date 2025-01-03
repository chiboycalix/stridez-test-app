// import { useEffect, useState, useCallback } from "react";
// import "../../styles/LiveUpdate.css";
// import Navbar from "../Explore/Navbar";
// import SideBar from "../Explore/SideBar";
// import Dropdown from "../Explore/Dropdown";
// import authService from "../../Services/Auth";
// import { Route, BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";

// const Base = () => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [auth, setAuth] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState({});
//   const baseUrl = process.env.REACT_APP_BASEURL;

//   const navigate = useNavigate();
//   const handleLive = () => {
//     navigate("/ScheduleForm");
//     console.log("Schedule");
//   };

//   const startLive = () => {
//     navigate("/StartLive");
//     console.log("Schedule");
//   };

//   const getCurrentUser = useCallback(async () => {
//     const response = await fetch(`${baseUrl}/auth/me`, {
//       headers: {
//         authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//       },
//     });
//     const data = await response.json();
//     if (response.ok) {
//       setUser(data.data);
//       setLoading(false);
//       console.log(user, data.data);
//     } else {
//       console.log("Something went wrong.............");
//     }
//   }, [baseUrl, user]);

//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   useEffect(() => {
//     getCurrentUser();

//     const authenticated = authService.isAuthenticated();
//     !authenticated ? setAuth(false) : setAuth(true);
//   }, [auth]);

//   return (
//       <div className="main-content flex flex-row justify-items-center items-start bg-white min-h-screen">
//         <SideBar auth={auth} setAuth={setAuth} user={user} />
//         <div className="flex flex-col ml-24 w-full">
//           <Navbar
//             toggleDropdown={toggleDropdown}
//             auth={auth}
//             setAuth={setAuth}
//             user={user}
//           />
//           {isDropdownOpen && <Dropdown auth={auth} setAuth={setAuth} />}
//           <div className="container  ">
//             <div className="md:col-span-3 grid grid-cols rounded bg-gray-50 gap-4 pl-10 ">
//               <div className="h-screen flex flex-col justify-center items-center gap-y-4">
//                 <Routes>
//                   <Route path="/SubscribeTo" element={<SubscribeTo />} />
//                   <Route path="/LiveUpdate" element={<LiveUpdate />} />
//                   <Route path="/ScheduleForm" element={<ScheduleForm />} />
//                 </Routes>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//   );
// };

// export default Base;
