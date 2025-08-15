
import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex pt-16 lg:pt-20">
        {/* Sidebar pour desktop */}
        <div className="hidden lg:block fixed left-0 top-16 lg:top-20 h-full bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
          <Sidebar />
        </div>
        
        {/* Sidebar mobile overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
              <div className="pt-20">
                <Sidebar />
              </div>
            </div>
          </div>
        )}
        
        <main className="flex-1 p-4 lg:p-6 lg:ml-64 xl:ml-72">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[calc(100vh-8rem)]">
              <div className="p-4 lg:p-6">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
