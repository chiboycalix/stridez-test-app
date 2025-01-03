// GuestList.js
import React, { useState} from "react";

const GuestList = ({ roomSubscribers }) => {
  const guests = roomSubscribers?.filter(subscriber => subscriber?.isCoHost === false && subscriber?.isOwner === false);
   console.log('guests:', guests);
  return (
    <div>
      <ul>
        {guests?.length > 0 ? (
          guests?.map(coHost => <li key={coHost.userId}>{coHost.username}</li>)
        ) : (
          <li>N/A</li>
        )}
      </ul>
    </div>
  );
};

export default GuestList;
