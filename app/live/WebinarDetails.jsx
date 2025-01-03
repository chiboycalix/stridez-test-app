// import React from 'react';
// import { useLocation, Link } from 'react-router-dom';

// const WebinarDetails = () => {
//   const location = useLocation();
//   const { formData } = location.state;

//   const isLive = () => {
//     const now = new Date();
//     const eventDate = new Date(formData.selectedDate);
//     const [startHour, startMinute] = formData.startTime.value.split(':');
//     const [endHour, endMinute] = formData.endTime.value.split(':');

//     eventDate.setHours(startHour, startMinute, 0, 0);
//     const endDate = new Date(eventDate);
//     endDate.setHours(endHour, endMinute, 0, 0);

//     return now >= eventDate && now <= endDate;
//   };

//   return (
//     <div>
//       <h1>{formData.webinarTitle}</h1>
//       <p>{formData.description}</p>
//       <p>Date: {formData.selectedDate.toString()}</p>
//       <p>Start Time: {formData.startTime.label}</p>
//       <p>End Time: {formData.endTime.label}</p>
//       <p>Timezone: {formData.selectedTimezone.label}</p>
//       <p>Guest: {formData.guestEmail}</p>
//       <p>Co-Guest: {formData.coGuestEmail}</p>
//       {isLive() ? (
//         <Link to="/live-page">Join Live Event</Link>
//       ) : (
//         <p>The event is not live yet. Please come back at the scheduled time.</p>
//       )}
//     </div>
//   );
// };

// export default WebinarDetails;
