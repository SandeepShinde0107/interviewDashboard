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
import ProtectedRoute from "./routes/ProtectedRoute";
import CandidatesPage from "./components/candidatePages/Candidate";
import CreateCandidate from "./components/candidatePages/CreateCandidate";
import CandidateForm from "./components/candidatePages/EditCandidate";
import ViewCandidate from "./components/candidatePages/ViewCandidate";
import RolesPage from "./components/roles/RolesPage";

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
        <Route path="/candidates/create" element={
          <ProtectedRoute>
            <CreateCandidate />
          </ProtectedRoute>
        } />
        <Route path="/candidates/:id/edit" element={
          <ProtectedRoute>
            <CandidateForm />
          </ProtectedRoute>
        } />
        <Route path="/candidates/:id/" element={
          <ProtectedRoute>
            <ViewCandidate />
          </ProtectedRoute>
        } />
        <Route path="/roles" element={
          <ProtectedRoute>
            <RolesPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
