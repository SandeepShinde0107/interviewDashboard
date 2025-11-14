// import './App.css'
// function App() {
//   return (
//     <>
//       <h1 className="text-4xl font-bold text-black">Hello React</h1>
//     </>
//   )
// }

// export default App


import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/DashBoard";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import ProtectedRoute from "./routes/ProtectedRoute";
import UserDetail from "./pages/UserDetail";
import CandidatesPage from "./pages/Candidate";

function App() {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<Login />} />
       <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/candidates" element={
            <ProtectedRoute>
              <CandidatesPage />
            </ProtectedRoute>
          } />
        <Route path="/dashboard/roles" element={
            <ProtectedRoute>
              <Roles/>
            </ProtectedRoute>
          } />
        <Route path="/dashboard/users/:id" element={
            <ProtectedRoute>
              <UserDetail/>
            </ProtectedRoute>
          } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
