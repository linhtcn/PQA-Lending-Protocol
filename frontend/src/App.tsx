import { BrowserRouter, Routes, Route } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ToastProvider } from './components/ToastProvider';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { Position } from './pages/Position';
import { Lending } from './pages/Lending';
import './index.css';

function App() {
  return (
    <Tooltip.Provider delayDuration={300}>
      <ToastProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="position" element={<Position />} />
            <Route path="lending" element={<Lending />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
    </Tooltip.Provider>
  );
}

export default App;
