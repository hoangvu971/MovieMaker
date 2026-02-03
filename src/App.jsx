import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import { ToastProvider } from './components/common/ToastProvider';

function App() {
    return (
        <ToastProvider>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/editor/:projectId" element={<EditorPage />} />
                <Route path="/editor" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ToastProvider>
    );
}

export default App;
