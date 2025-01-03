import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import SplashScreen from "./SplashScreen.jsx";
import AuthForm from "./AuthForm.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import Success from "./Success.jsx";
import EmailVerify from "./EmailVerify.jsx";
import SelectUseCase from "./SelectUseCase.jsx";
import TopicSelection from "./Profile/TopicSelection.jsx";
import DeleteUser from "./DeleteUser.jsx";
import SetupProfile from "./Profile/SetupProfile.jsx";
import Welcome from "./Welcome.jsx";
import ResetPassword from "./ResetPassword.jsx";
import HandleGoogleRedirect from "./HandleGoogleRedirect.jsx";
import PasswordUpdate from "./PasswordUpdate.jsx";
import PasswordCongrat from "./PasswordCongrat.jsx";
import SubscribeTo from "./SubscribeTo.jsx";
import SchedulePage from "./Live/SchedulePage.jsx";
import ScheduleRemainder from "./Live/ScheduleRemainder.jsx";
import Live from "./Live/Live.jsx";
import PermissionWeb from "./Live/PermissionWeb.jsx";
import MutedWeb from "./Live/MutedWeb.jsx";
import PreparationArea from "./Live/PreparationArea.jsx";
import StartLive from "./Live/StartLive.jsx";
import Streaming from "./Live/Streaming.jsx";
import CoursesManagementPage from "./Courses/CoursesManagementPage.jsx";
import Uploads from "./Uploads/Uploads.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../styles/Details.css";
import authService from "../Services/Auth.jsx";
import { BsX } from "react-icons/bs";
import MainLayout from "../layouts/MainLayout.jsx";
import Profile from "../pages/Profile.jsx";
import NotFound from "../pages/NotFound.jsx";
import CoursesPage from "./Courses/CoursePage.jsx";
import ScheduleDetailsContainer from "./Live/ScheduleDetails.jsx";
import PostModalWrapper from "./post/PostModalWrapper.jsx";
import Explore from "../pages/Explore.jsx";
import FollowModal from "./Profile/FollowModal.jsx";
import CourseDetailPage from "./Courses/CourseDetailPage.jsx";

const Auth = () => {
  const navigate = useNavigate();
  return (
    <div className="grid relative grid-cols-1 xl:grid-cols-5 h-screen w-full bg-white">
      <button
        onClick={() => navigate("/")}
        className="fixed top-7 right-7 p-1.5 bg-slate-100 rounded-full"
      >
        <BsX className="text-xl" />
      </button>
      <SplashScreen />
      <AuthForm />
    </div>
  );
};

const Details = () => {
  const [auth, setAuth] = useState(false);
  const location = useLocation();
  const background = location.state && location.state.background;

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setAuth(authenticated);
  }, [setAuth]);

  return (
    <>
      {background && (
        <Routes>
          <Route path="/p/:id" element={<PostModalWrapper />} />
          <Route
            path="/profile/:id/followers"
            element={<FollowModal type="followers" />}
          />
          <Route
            path="/profile/:id/followings"
            element={<FollowModal type="followings" />}
          />
        </Routes>
      )}
      <Routes location={background || location}>
        <Route path="/auth" element={<Auth />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Explore />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/live" element={<Live />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route
            path="/schedule/details/:id"
            element={<ScheduleDetailsContainer />}
          />
          <Route path="/upload" element={<Uploads />} />
          <Route path="/profile/:id" element={<Profile />} />
          {/* Background modal to avoid 404 */}
          <Route path="/p/:id" element={<PostModalWrapper />} />
          {/* End of background modal */}
          <Route path="/courses" element={<CoursesManagementPage />} />
          <Route path="/courses/:id/" element={<CoursesPage />} />
          <Route path="/course/:id/" element={<CourseDetailPage />} />
          <Route path="/streaming/:id" element={<Streaming />} />
        </Route>
        <Route path="/subscribeTo" element={<SubscribeTo />} />
        <Route path="/permissionWeb" element={<PermissionWeb />} />
        <Route path="/mutedWeb" element={<MutedWeb />} />
        <Route path="/preparationArea" element={<PreparationArea />} />
        <Route path="/subscribeTo" element={<SubscribeTo />} />
        <Route path="/permissionWeb" element={<PermissionWeb />} />
        <Route path="/mutedWeb" element={<MutedWeb />} />
        <Route path="/preparationArea" element={<PreparationArea />} />
        <Route path="/scheduleRemainder/:id" element={<ScheduleRemainder />} />
        <Route path="/startLive" element={<StartLive />} />
        <Route path="/deleteUser" element={<DeleteUser />} />
        <Route path="/topicSelection" element={<TopicSelection />} />
        <Route path="/setupprofile" element={<SetupProfile />} />
        <Route
          path="/auth/callback/google"
          element={<HandleGoogleRedirect />}
        />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/success" element={<Success />} />
        <Route path="/emailVerify" element={<EmailVerify />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/passwordUpdate/:tempToken" element={<PasswordUpdate />} />
        <Route path="/passwordCongrat" element={<PasswordCongrat />} />
        <Route path="/selectUseCase" element={<SelectUseCase />} />
      </Routes>
    </>
  );
};

export default Details;
