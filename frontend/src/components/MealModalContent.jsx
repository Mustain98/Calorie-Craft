import "../pages/ShowAllMeal.css";
export default function MealModalContent({ selectedMeal }) {
  return (
    <>
      <div className="ingredients-section">
        <h3>Ingredients</h3>
        <div className="ingredients-list">
          {selectedMeal.foodItems?.length
            ? selectedMeal.foodItems.map((item, idx) => (
                <div key={idx} className="ingredient-item">
                  <span>
                    {item.quantity}× {item.food.name}
                  </span>
                </div>
              ))
            : selectedMeal.ingredients?.map((ing, i) => (
                <div key={i} className="ingredient-item">
                  <span>{ing}</span>
                </div>
              ))}
        </div>
      </div>

      <div className="nutrition-section">
        <h1>Nutritions</h1>
        <div className=" nutrition-grid">
          <div className="nutrition-item">
            <span className="nutrition-label">Calories</span>
            <span className="nutrition-value">
              {selectedMeal.totalCalories}
            </span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Protein</span>
            <span className="nutrition-value">{selectedMeal.totalProtein}</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Carbohydrate</span>
            <span className="nutrition-value">{selectedMeal.totalCarbs}</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Fat</span>
            <span className="nutrition-value">{selectedMeal.totalFat}</span>
          </div>
        </div>
      </div>
    </>
  );
}
