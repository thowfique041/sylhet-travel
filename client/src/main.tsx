import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { TripProvider } from './context/TripContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <AuthProvider>
              <FavoritesProvider>
                <TripProvider>
                  <App />
                </TripProvider>
              </FavoritesProvider>
            </AuthProvider>
          </ThemeProvider>
        </MotionConfig>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
