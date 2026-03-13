import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Committee from './pages/Committee'
import About from './pages/About'
import Contact from './pages/Contact'
// Admin
import AdminLogin      from './pages/admin/AdminLogin'
import AdminDashboard  from './pages/admin/AdminDashboard'
import AdminEvents     from './pages/admin/AdminEvents'
import AdminCommittee      from './pages/admin/AdminCommittee'
import AdminChangePassword from './pages/admin/AdminChangePassword'
import AdminMessages       from './pages/admin/AdminMessages'
import ForgotPassword      from './pages/admin/ForgotPassword'
import ResetPassword       from './pages/admin/ResetPassword'
import AdminLayout         from './components/admin/AdminLayout'
import ProtectedRoute      from './components/admin/ProtectedRoute'

/* Public site wrapper — Header + Footer around an Outlet */
function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800/70 py-6 text-center text-slate-600 text-sm">
        © {new Date().getFullYear()} Blitzkrieg Chess Club VNIT. All rights reserved.
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ── Public site ── */}
          <Route element={<PublicLayout />}>
            <Route path="/"          element={<Home />} />
            <Route path="/events"    element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/committee" element={<Committee />} />
            <Route path="/about"     element={<About />} />
            <Route path="/contact"   element={<Contact />} />
          </Route>

          {/* ── Admin: login (no auth required) ── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />

          {/* ── Admin: protected area with sidebar layout ── */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index           element={<AdminDashboard />} />
            <Route path="events"   element={<AdminEvents />} />
            <Route path="committee" element={<AdminCommittee />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="change-password" element={<AdminChangePassword />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
