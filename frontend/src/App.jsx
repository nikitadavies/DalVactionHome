import React, { useState } from 'react';
import awsConfig from './aws-config';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ListRooms } from './pages/ListRooms/ListRooms';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import RoomDetails from './pages/RoomDetails/RoomDetails';
import ReviewList from './pages/Reviews/Reviews';
import Statistics from './pages/Statistics/Statistics';
import Notifications from './pages/Notifications/Notifications';
import AnswerNotification from './pages/Notifications/AnswerNotification';
import { Authentication } from './components/Authentication';
import { AgentRooms } from "./pages/AgentRooms/AgentRooms";

function App() {
  return (
    <Router>
       <Navbar />
    
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rooms" element={<ListRooms />} />
          <Route path="/room-details/:roomId" element={<RoomDetails />} />
          <Route path="/reviews/:roomId" element={<ReviewList/>} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/customer-concerns" element={<Notifications />} />
          <Route path="/customer-concerns/:id" element={<AnswerNotification/>} />
          <Route path="/login" element={<Authentication />} />
          <Route path="/agent-rooms" element={<AgentRooms />} />
        </Routes>
    
    </Router>
  );
}

export default App;
