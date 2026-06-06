import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateProperty from './pages/CreateProperty';
import PropertyDetails from './pages/PropertyDetails';
import MyProperties from './pages/MyProperties';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                {/* 🟢 PUBLIC ROUTES: Anyone can access these without logging in */}

                {/* Make Dashboard the default homepage so people can browse properties right away */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* 🔴 PROTECTED ROUTES: You MUST be logged in to see these */}

                <Route path="/property/:id" element={
                    <ProtectedRoute>
                        <PropertyDetails />
                    </ProtectedRoute>
                } />

                <Route path="/create-property" element={
                    <ProtectedRoute>
                        <CreateProperty />
                    </ProtectedRoute>
                } />

                <Route path="/my-properties" element={
                    <ProtectedRoute>
                        <MyProperties />
                    </ProtectedRoute>
                } />

            </Routes>
        </Router>
    );
}

export default App;