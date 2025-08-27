import React from "react";
import AdminSidebar from "../components/AdminSidebar";
import MealForm from "../components/MealComponents/mealForm";

export default function AdminCreateMeal() {
  return (
    <MealForm
      apiBaseUrl="http://localhost:5001"
      userEndpoint="/api/admin/me"
      submitEndpoint="/api/admin/meal"
      SidebarComponent={AdminSidebar}
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
