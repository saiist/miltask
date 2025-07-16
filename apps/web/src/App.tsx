import { Routes, Route, Navigate } from 'react-router'
import { ThemeProvider } from './components/theme-provider'
import { QueryProvider } from './contexts/query-client'
import { PublicRoute, PrivateRoute } from './components/PrivateRoute'
import Layout from './components/Layout'
import { Toaster } from "@/components/ui/toaster"
import AuthForm from "@/components/auth-form"
import Dashboard from "./pages/Dashboard"
import NotificationSettings from "./pages/NotificationSettings"
import Statistics from "./pages/Statistics"

function App() {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* デフォルトルート - ダッシュボードへリダイレクト */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* パブリックルート */}
            <Route path="login" element={
              <PublicRoute>
                <AuthForm />
              </PublicRoute>
            } />
            
            {/* プライベートルート */}
            <Route path="dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="notifications" element={
              <PrivateRoute>
                <NotificationSettings />
              </PrivateRoute>
            } />
            
            <Route path="statistics" element={
              <PrivateRoute>
                <Statistics />
              </PrivateRoute>
            } />
          </Route>
        </Routes>
        <Toaster />
      </ThemeProvider>
    </QueryProvider>
  )
}

export default App