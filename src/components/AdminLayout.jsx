import React from 'react';


const AdminLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
