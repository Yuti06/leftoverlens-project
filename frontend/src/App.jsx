import React, { useState, useCallback } from "react";
import LandingPage from "./pages/LandingPage";
import ScanPage from "./pages/ScanPage";
import IngredientsPage from "./pages/IngredientsPage";
import RecipesPage from "./pages/RecipesPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import TipsPage from "./pages/TipsPage";
import Header from "./components/Header";

const PAGES = {
  LANDING: "landing",
  SCAN: "scan",
  INGREDIENTS: "ingredients",
  RECIPES: "recipes",
  RECIPE_DETAIL: "recipe_detail",
  TIPS: "tips",
};

export default function App() {
  const [page, setPage] = useState(PAGES.LANDING);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [sceneDescription, setSceneDescription] = useState("");
  const [filters, setFilters] = useState({ dietary: "none", maxTime: null, cuisine: "any" });

  const navigate = useCallback((target) => {
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAnalysisComplete = useCallback((data) => {
    setIngredients(data.ingredients || []);
    setSceneDescription(data.scene_description || "");
    navigate(PAGES.INGREDIENTS);
  }, [navigate]);

  const handleRecipesGenerated = useCallback((data) => {
    setRecipes(data.recipes || []);
    navigate(PAGES.RECIPES);
  }, [navigate]);

  const handleSelectRecipe = useCallback((recipe) => {
    setSelectedRecipe(recipe);
    navigate(PAGES.RECIPE_DETAIL);
  }, [navigate]);

  const handleReset = useCallback(() => {
    setIngredients([]);
    setRecipes([]);
    setSelectedRecipe(null);
    setSceneDescription("");
    navigate(PAGES.LANDING);
  }, [navigate]);

  const showHeader = page !== PAGES.LANDING;

  const getStepNumber = () => {
    const steps = { scan: 1, ingredients: 2, recipes: 3, recipe_detail: 3, tips: 4 };
    return steps[page] || 0;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {showHeader && (
        <Header
          onReset={handleReset}
          onNavigate={navigate}
          currentPage={page}
          step={getStepNumber()}
          pages={PAGES}
        />
      )}

      <main style={{ flex: 1 }}>
        {page === PAGES.LANDING && (
          <LandingPage onStart={() => navigate(PAGES.SCAN)} />
        )}
        {page === PAGES.SCAN && (
          <ScanPage
            onAnalysisComplete={handleAnalysisComplete}
            onBack={() => navigate(PAGES.LANDING)}
          />
        )}
        {page === PAGES.INGREDIENTS && (
          <IngredientsPage
            ingredients={ingredients}
            setIngredients={setIngredients}
            sceneDescription={sceneDescription}
            filters={filters}
            setFilters={setFilters}
            onGetRecipes={handleRecipesGenerated}
            onScanAgain={() => navigate(PAGES.SCAN)}
            onViewTips={() => navigate(PAGES.TIPS)}
          />
        )}
        {page === PAGES.RECIPES && (
          <RecipesPage
            recipes={recipes}
            ingredients={ingredients}
            filters={filters}
            setFilters={setFilters}
            onSelectRecipe={handleSelectRecipe}
            onBack={() => navigate(PAGES.INGREDIENTS)}
            onRegenerate={handleRecipesGenerated}
          />
        )}
        {page === PAGES.RECIPE_DETAIL && (
          <RecipeDetailPage
            recipe={selectedRecipe}
            onBack={() => navigate(PAGES.RECIPES)}
            onReset={handleReset}
          />
        )}
        {page === PAGES.TIPS && (
          <TipsPage
            ingredients={ingredients}
            onBack={() => navigate(PAGES.INGREDIENTS)}
          />
        )}
      </main>
    </div>
  );
}

export { PAGES };
