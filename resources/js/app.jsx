import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import your pages/components

import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import SkillPage from "./pages/skill/SkillPage";
import ProjectPage from "./pages/project/ProjectPage";
import ExperiencePage from "./pages/experience/ExperiencePage";
import ExperienceInfoPage from "./pages/experience/ExperienceInfoPage";
import EducationInfoPage from "./pages/education/EducationInfoPage";
import EducationTypePage from "./pages/education/EducationTypePage";
import ShortSoursePage from "./pages/education/ShortSoursePage";
import SchoolPage from "./pages/education/SchoolPage";
import ProjectTypePage from "./pages/project/ProjectTypePage";
import ProjectInfoPage from "./pages/project/ProjectInfoPage";
import SkillInfoPage from "./pages/skill/SkillInfoPage";
import SkillTypePage from "./pages/skill/SkillTypePage";
import TalkPage from "./pages/contact/TalkPage";
import ContactInfoPage from "./pages/contact/ContactInfoPage";
import ConnectMePage from "./pages/contact/ConnectMePage";
import SettingPage from "./pages/setting/SettingPage";
import ProfilePage from "./pages/home/ProfilePage";


const App = () => {

  return (
    <BrowserRouter>
        <Routes>
          <Route element={<MainLayout/>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/home.profile" element={<ProfilePage />} />
            <Route path="/exp.experience_info" element={<ExperienceInfoPage />} />
            <Route path="/exp.experience" element={<ExperiencePage />} />
            <Route path="/edu.education_info" element={<EducationInfoPage />} /> 
            <Route path="/edu.education_type" element={<EducationTypePage />} /> 
            <Route path="/edu.school" element={<SchoolPage />} /> 
            <Route path="/edu.short_course" element={<ShortSoursePage />} />
            <Route path="/pro.project" element={<ProjectPage />} />  
            <Route path="/pro.project_info" element={<ProjectInfoPage  />} />
            <Route path="/pro.project_type" element={<ProjectTypePage />} />
            

            <Route path="/sk.skill_info" element={<SkillInfoPage />} />
            <Route path="/sk.skill_type" element={<SkillTypePage />} />
            <Route path="/sk.skill" element={<SkillPage/>} />
            <Route path="/con.contact_me" element={<ConnectMePage />} />
            <Route path="/con.contact_info" element={<ContactInfoPage />} />
            <Route path="/con.talk" element={<TalkPage />} />

            <Route path="/setting" element={<SettingPage />} />
            

            {/* Optional: 404 route */}
            <Route path="*" element={<h1>404 - Not Found</h1>} />
          </Route>

          {/* <Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
          </Route> */}
        </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
