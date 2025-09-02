import React, { useState } from "react";
import Sidebar from "../components/sideBar";
import MealForm from "../components/MealComponents/mealForm";
import {toast} from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function CreateMeal() {
  const [share, setShare] = useState(false);

  return (
    <MealForm
      apiBaseUrl={process.env.REACT_APP_API_BASE_URL}
      userEndpoint="/api/users/me"
      submitEndpoint="/api/users/me/myMeals"
      UserSidebarComponent={Sidebar}
      loginRedirectPath="/signin"
      successMessages={{
        saved: "Meal saved successfully!",
        shared: "Meal saved and shared successfully!",
      }}
      buttonLabels={[
        { text: "Save to My Meals", onClick: () => setShare(false) },
      ]}
      shareState={[share, setShare]}
    />
  );
}
