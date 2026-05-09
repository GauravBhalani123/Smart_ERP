import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import ProductsPage from "./pages/modules/ProductsPage";
import InventoryPage from "./pages/modules/InventoryPage";
import SuppliersPage from "./pages/modules/SuppliersPage";
import CustomersPage from "./pages/modules/CustomersPage";
import PurchasesPage from "./pages/modules/PurchasesPage";
import SalesPage from "./pages/modules/SalesPage";
import InvoicesPage from "./pages/modules/InvoicesPage";
import ReportsPage from "./pages/modules/ReportsPage";
import UsersPage from "./pages/modules/UsersPage";
import NotificationsPage from "./pages/modules/NotificationsPage";
import AIAssistantPage from "./pages/modules/AIAssistantPage";
import MarketIntelligencePage from "./pages/modules/MarketIntelligencePage";
import CategoriesPage from "./pages/modules/CategoriesPage";
import ProductionPage from "./pages/modules/ProductionPage";
import SettingsPage from "./pages/modules/SettingsPage";

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" replace />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
      <Route path="/production" element={<ProtectedRoute><ProductionPage /></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
      <Route path="/purchases" element={<ProtectedRoute><PurchasesPage /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
      <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
      <Route path="/market-intelligence" element={<ProtectedRoute><MarketIntelligencePage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
