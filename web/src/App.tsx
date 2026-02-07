import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import ResumeEditorPage from "./pages/ResumeEditorPage";
import ResumesPage from "./pages/ResumesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/resumes" replace />} />
        <Route path="/resumes" element={<ResumesPage />} />
        <Route path="/resumes/:resumeId" element={<ResumeEditorPage />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
