import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import MedoraAiAssistant from './components/MedoraAiAssistant.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
            <MedoraAiAssistant />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
