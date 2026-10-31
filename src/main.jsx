import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import RootLayout from './layouts/RootLayout.jsx';
import { Provider } from 'react-redux';
import Home from './pages/Home.jsx'
import store from "./redux/index"

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/chat/info" />,
      },
      {
        path: '/chat/info',
        element: <Home />
      },
      {
        path: '/chat/:id',
        element: <Home />
      }
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
