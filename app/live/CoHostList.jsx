// CoHostList.js
import React from "react";

const CoHostList = ({ roomSubscribers }) => {
    const coHosts = roomSubscribers?.filter(subscriber => subscriber?.isCoHost === true);
    return (
        <div>
            <ul>
                {coHosts?.length > 0 ? (
                    coHosts?.map(coHost => (<li key={coHost?.userId}>{coHost?.username}</li>))
                ) : (
                    <li>N/A</li>
                )}
            </ul>
        </div>
    );
};

export default CoHostList;
