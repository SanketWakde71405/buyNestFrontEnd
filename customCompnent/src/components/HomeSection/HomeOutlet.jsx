import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../contexts/AuthContext";
import HeroSection from "./Screens/HeroSection";
import Onboarding from "./Screens/Onboarding";
import StoreSetupDashboard from "./Screens/StoreSetupDashboard";
import FinalHomePage from "./Screens/FinalHomePage";

import ProductApi from "../../services/ProductApi";

function HomeOutlet() {
  const { user, isFirstLogin, loading, completeOnboarding } = useAuth();

  // Initialize as an empty array
  const [products, setProducts] = useState([]);

  // Loading state for products
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await ProductApi.getAllProducts();

        const productsList = response?.data || response || [];

        setProducts(productsList);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // Still resolving auth state
  if (loading) {
    return null;
  }

  // Not logged in
  if (!user) {
    return <HeroSection />;
  }

  // First-time user
  if (isFirstLogin) {
    return <Onboarding onDismiss={completeOnboarding} />;
  }

  // Wait until products are loaded
  if (loadingProducts) {
    return null; // You can replace this with a spinner/skeleton
  }

  // User has fewer than 10 products
  if (products.length < 10) {
    return (
      <StoreSetupDashboard products={products} storeOwnerName={user?.name} />
    );
  }

  // User has 10 or more products
  return (
    <FinalHomePage
      storeOwnerName={user?.name}
      productsCount={products.length}
      onGoToDashboard={() => {
        navigate("/dashboard");
      }}
    />
  );
}

export default HomeOutlet;
