import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AuthOnly from './components/AuthOnly';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Invite from './pages/Invite';
import Dashboard from './pages/Dashboard';
import NewSplit from './pages/NewSplit';
import GroupDashboard from './pages/GroupDashboard';
import AddExpense from './pages/AddExpense';
import MySplits from './pages/MySplits';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/invite/:token" element={<Invite />} />

      {/* Full-screen protected flows (no sidebar) */}
      <Route element={<AuthOnly />}>
        <Route path="/new-split" element={<NewSplit />} />
        <Route path="/groups/:id/expenses/new" element={<AddExpense />} />
        <Route path="/groups/:id/expenses/:expenseId/edit" element={<AddExpense />} />
      </Route>

      {/* App shell with sidebar */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups/:id" element={<GroupDashboard />} />
        <Route path="/my-splits" element={<MySplits />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
