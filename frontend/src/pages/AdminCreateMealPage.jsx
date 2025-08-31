import React from "react";
import AdminSidebar from "../components/AdminSidebar";
import MealForm from "../components/MealComponents/mealForm";

export default function AdminCreateMeal() {
  return (
    <MealForm
      apiBaseUrl={process.env.REACT_APP_API_ADMIN_URL}
      userEndpoint="/api/admin/me"
      submitEndpoint="/api/admin/meal"
      AdminSidebarComponent={AdminSidebar}
      loginRedirectPath="/adminsignin"
      successMessages={{
        saved: "Meal saved successfully!",
        shared: "Meal saved successfully!",
      }}
      buttonLabels={[{ text: "Save to System Collection" }]}
      shareState={[false]} // no share toggle for admin
    />
  );
}
