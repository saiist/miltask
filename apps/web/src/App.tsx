import { Routes, Route } from 'react-router'
import { ThemeProvider } from './components/theme-provider'
import Layout from './components/Layout'
import { Toaster } from "@/components/ui/toaster"
import AuthForm from "@/components/auth-form"


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route path="login" element={<AuthForm />} />
              </Route>
            </Routes>
          <Toaster />
    </ThemeProvider>
  )
}

export default App