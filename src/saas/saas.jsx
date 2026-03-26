import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Medesk from './medesk.jsx';

// This component routes all /saas/* paths to the appropriate SaaS components
const SaasRouter = () => {
    const location = useLocation();

    // You can add more SaaS products here in the future
    // For now, we're routing /saas/medesk to the Medesk component

    return (
        <Routes>
            <Route path="medesk" element={<Medesk />} />
            {/* Add more SaaS routes here as needed */}
            {/* <Route path="other-saas" element={<OtherSaas />} /> */}
        </Routes>
    );
};

export default SaasRouter;