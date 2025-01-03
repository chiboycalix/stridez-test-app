import { useState, useEffect } from "react";
import "../../styles/LiveUpdate.css";
import Navbar from "../Explore/Navbar";
import SideBar from "../Explore/SideBar";
import Dropdown from "../Explore/Dropdown";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../Providers/AuthProvider";
import Webinar from "../../assets/Webinar.png";
import EditIcon from "../../assets/EditIcon.png";
import BellOn from "../../assets/BellOn.png";
import PostIcon from "../../assets/PostIcon.png";
import LinkIcon from "../../assets/LinkIcon.png";
import Delete from "../../assets/Delete.png";
import "react-datepicker/dist/react-datepicker.css";


const ScheduleRemainder = () => {
  const { id } = useParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBoxVisible, setIsBoxVisible] = useState(true);
  const [scheduleDetails, setScheduleDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [remindCoHost, setRemindCoHost] = useState(false);
  const { auth, setAuth, getCurrentUser, getAuth } = useAuth();
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const MyCar = () => {
    navigate(`/ScheduleDetails/${id}`);
  };
  const NowMan = () => {
    navigate(`/ScheduleDetails/${id}`);
  };

  const fetchScheduleDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/schedules/${id}`);
      if (response.ok) {
        const data = await response.json();
        setScheduleDetails(data.data);
        setLoading(false);
      } else {
        console.error("Failed to fetch schedule details.");
      }
    } catch (error) {
      console.error("Error fetching schedule details:", error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/v1/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          remindCoHost,
        }),
      });
      if (response.ok) {
        setSuccessMessage("Reminder set successfully!");
      } else {
        setSuccessMessage("Failed to set reminder.");
      }
    } catch (error) {
      console.error('Error setting reminder:', error);
      setSuccessMessage("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    fetchScheduleDetails();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-content flex flex-row justify-items-center items-start bg-white min-h-screen relative">
      <SideBar auth={getAuth()} setAuth={setAuth} user={getCurrentUser()} />
      <div className="flex flex-col ml-24 w-full">
        <Navbar
          toggleDropdown={toggleDropdown}
          auth={getAuth()}
          setAuth={setAuth}
          user={getCurrentUser()}
        />
        {isDropdownOpen && <Dropdown auth={auth} setAuth={setAuth} />}
        <div className="container">
          <div className="md:col-span-3 grid grid-cols rounded bg-gray-50 gap-4 pl-10">
            <div className="min-h-screen flex flex-col justify-center items-center gap-y-4 pt-10">
              {isBoxVisible && (
                <div
                  className="fixed inset-0 flex justify-center items-center transition-opacity duration-500 ease-in-out"
                  style={{ background: "rgba(0, 0, 0, 0.20)" }}
                >
                  <div
                    className="transition-transform duration-500 ease-in-out flex flex-col justify-start items-start p-4 relative"
                    style={{
                      width: "1000px",
                      height: "600px",
                      borderRadius: "16px",
                      border: "1px solid #D9D9D9",
                      backgroundColor: "#FFF",
                      transform: isBoxVisible ? "translateY(0)" : "translateY(-100vh)",
                      overflowY: "auto",
                    }}
                  >
                    <h1 className="mb-4">Manage Live</h1>
                    <div className="flex flex-col justify-start items-start absolute top-4 right-4 mr-80 ">
                      <h1 className="text-xl font-bold mb-4">Set Reminder</h1>
                      <form onSubmit={handleFormSubmit}>
                        <div className="mb-4">
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            Date
                          </label>
                          <input
                            type="date"
                            id="date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                            Set Time
                          </label>
                          <input
                            type="time"
                            id="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div className="mb-4 flex items-center">
                          <input
                            type="checkbox"
                            id="remindCoHost"
                            checked={remindCoHost}
                            onChange={() => setRemindCoHost(!remindCoHost)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <label
                            htmlFor="remindCoHost"
                            className="ml-2 block text-sm font-medium text-gray-700"
                          >
                            Remind co-host
                          </label>
                        </div>
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Set Reminder
                        </button>
                      </form>
                      {successMessage && <p className="mt-4 text-green-600">{successMessage}</p>}
                    </div>
                    <div className="flex flex-col justify-start items-start absolute top-4 right-4 mr-32 ">
                      <button onClick={MyCar}>X</button>
                    </div>
                    <button onClick={()=>{fetchScheduleDetails(); NowMan();}}  className=" flex mb-2 ">
                    <img src={Webinar} alt="Webinar" />   <span className="ml-4">Webinar Details</span>
                    </button>
                    <button onClick={handleEditClick} className=" flex mb-2 ">
                      <img src={EditIcon} alt="Edit" /> <span className="ml-4">Edit</span>
                    </button>
                    <button className=" flex mb-2">
                      <img src={BellOn} alt="SetRemainder" /> <span className=" ml-4">Set Reminder</span>
                    </button>
                    <button className=" flex mb-2 ">
                      <img src={PostIcon} alt="SharePost" /> <span className="ml-4">Share Post</span>
                    </button>
                    <button className=" flex mb-2">
                      <img src={LinkIcon} alt="ShareLink" /> <span className="ml-4">Share Link</span>
                    </button>
                    <button className="mb-2">
                      Cancel Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleRemainder;
