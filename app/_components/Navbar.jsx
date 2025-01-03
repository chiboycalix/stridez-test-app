import Notification from "../../assets/icons/Notification.png";
import Ellipse from "../../assets/Ellipse.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import searchIcons from "../../assets/icons/searchIcons.png";

const Navbar = ({ toggleDropdown, auth, user }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="flex position-top z-[1] bg-white p-4 justify-between items-center ">
      <div className="flex">
        <input
          type="search"
          placeholder="Search"
          className="nav-search-input border-gray-300 bg-gray-50 h-12 "
        />
        <button className="nav-search-button  bg-gray-50 border-gray-300 text-white px-4 h-12">
          <img
          src={searchIcons}
          alt="search icon"
          className=""
        />
        </button>

      </div>
      <div>
        {!loading && !auth ? (
          <button
            onClick={() => navigate("/")}
            className="bg-purple-900 text-white px-4 py-1 rounded-lg mx-auto h-12"
          >
            Sign Up
          </button>
        ) : (
          <div className="flex items-center space-x-4">
            <img src={Notification} alt="Notifications" className="w-6 h-6" />
            {!loading &&
              (user && user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer"
                  onClick={toggleDropdown}
                />
              ) : (
                <img
                  src={Ellipse}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer"
                  onClick={toggleDropdown}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
