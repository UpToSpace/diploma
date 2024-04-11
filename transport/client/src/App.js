import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useRoutes } from "./routes";
import { useAuth } from "./hooks/auth.hook";
import { Toaster } from 'react-hot-toast';
import { AuthContext } from "./context/AuthContext";
import { Loader } from "./components/Loader";
import { useHttp } from "./hooks/http.hook";
import Layout from './components/Layout';
import { ErrorBoundary } from './pages/errorpages/ErrorBoundary';
import { Route, Routes } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

function App() {
  const { login, logout, userId, ready, userRole } = useAuth();
  const { request } = useHttp();
  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
  console.log('App.js: userRole = ', userRole)

  const routes = useRoutes(userRole);

  if (!ready || userRole === undefined) {
    return <Loader />
  }

  return (
    <AuthContext.Provider value={{ userId, login, logout, userRole }}>
      <ErrorBoundary>
        <Elements stripe={stripePromise}>
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
        <Router>
            <Routes>
              {routes}
            </Routes>
        </Router>
        </Elements>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}

export default App;