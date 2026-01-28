import { Dashboard } from './components/Dashboard';
import { ToastProvider } from './components/ToastProvider';
import './index.css';

function App() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}

export default App;
