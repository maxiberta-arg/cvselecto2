import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../views/Home';
import CandidatoDashboard from '../views/CandidatoDashboard';
import EmpresaDashboard from '../views/EmpresaDashboard';
import AdminDashboard from '../views/AdminDashboard';

// Rutas principales de la app
export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/candidato" element={<CandidatoDashboard />} />
        <Route path="/empresa" element={<EmpresaDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
