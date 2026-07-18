import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Terminology from "./pages/Terminology";
import DatabaseTerms from "./pages/DatabaseTerms";
import TermDetail from "./pages/TermDetail";
import TermEdit from "./pages/TermEdit";
import Resources from "./pages/Resources";
import DatabaseResources from "./pages/DatabaseResources";
import Learn from "./pages/Learn";
import Translate from "./pages/Translate";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/terminology" element={<Terminology />} />
      <Route path="/terminology/:dbId" element={<DatabaseTerms />} />
      <Route path="/terminology/:dbId/term/:termId" element={<TermDetail />} />
      <Route path="/terminology/:dbId/term/:termId/edit" element={<TermEdit />} />
      <Route path="/terminology/:dbId/term/new" element={<TermEdit />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/resources/:dbId" element={<DatabaseResources />} />
      <Route path="/learn/:mode" element={<Learn />} />
      <Route path="/translate" element={<Translate />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
