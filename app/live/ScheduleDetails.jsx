import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Providers/AuthProvider";
import ScheduleDetailsView from './ScheduleDetailsView.jsx';
import ScheduleDetailsEdit from './ScheduleDetailsEdit.jsx';
import ScheduleActions from './ScheduleActions.jsx';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';

const ScheduleDetailsContainer = () => {
  const [scheduleDetails, setScheduleDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_BASEURL;

  const { id } = useParams();


  const fetchScheduleDetails = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/schedules/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
        },
      });
      const data = await response.json();
      const schedule = await data?.data;
      setScheduleDetails(schedule);
      setEditedDetails({
        ...schedule,
      });
    } catch (error) {
      console.error("Error fetching schedule details:", error);
    }
  }, [baseUrl, id]);

  const handleDeleteClick = async () => {
    if (!scheduleDetails) {
      console.error("No schedule details available to delete");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/schedules/${scheduleDetails.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get('accessToken')}`,
        },
      });

      if (response.ok) {
        setSuccessMessage("Schedule deleted successfully!");
        setTimeout(() => {
          setSuccessMessage("");
          navigate('/SchedulePage');
        }, 2000);
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };


  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      setEditedDetails((prevDetails) => ({
        ...prevDetails,
        date: date.toISOString(),
      }));
    }
  };


  const handleUpdate = async () => {
    if (!scheduleDetails) {
      console.error("No schedule details available to update");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/schedules/${scheduleDetails.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get('accessToken')}`,
        },
        body: JSON.stringify(editedDetails),
      });
      const data = await response.json();

      if (response.ok) {
        setScheduleDetails(data.data);
        setIsEditing(false);
        setSuccessMessage("Schedule details updated successfully!");
        setTimeout(() => setSuccessMessage(""), 2000);
      } else {
        console.error("Error updating schedule details:", data);
      }
    } catch (error) {
      console.error("Network error updating schedule:", error);
    }
  };


  useEffect(() => {
    fetchScheduleDetails();
  }, [fetchScheduleDetails]);


  return (
    <div className="container">
      <div className="rounded bg-gray-50 gap-4">
        <div className="min-h-screen flex gap-3 justify-center items-center">
          <ScheduleActions
            fetchScheduleDetails={fetchScheduleDetails}
            handleDeleteClick={handleDeleteClick}
            setIsEditing={setIsEditing}
            scheduleDetails={scheduleDetails}
          // setVisibility={setIsDetailsVisible}
          />
          {isEditing ? (
            <ScheduleDetailsEdit
              editedDetails={editedDetails}
              handleInputChange={handleInputChange}
              handleDateChange={handleDateChange}
              handleUpdate={handleUpdate}
              selectedDate={selectedDate}
              scheduleDetails={scheduleDetails}
              setSuccessMessage={setSuccessMessage}
            />
          ) : (
            scheduleDetails ? (
              <ScheduleDetailsView
                scheduleDetails={scheduleDetails}
                setIsEditing={setIsEditing}
                successMessage={successMessage}
              />
            )
              : (
                <p>No schedule details available.</p>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailsContainer;
