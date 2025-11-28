import React, { useState } from 'react';
import { LogOut, LayoutGrid, Factory } from 'lucide-react';

/**
 * @component StationContent
 * @description Ang generic component na ito ay kumakatawan sa bawat estasyon (Station 1 hanggang 15).
 * Nagpapakita ito ng impormasyon ng user at nagpapakita ng station number.
 * @param {number} stationNumber - Ang numero ng estasyon na kasalukuyang tinitingnan.
 * @param {object} user - Impormasyon ng kasalukuyang user.
 * @param {function} onLogout - Function para mag-logout.
 */
const StationContent = ({ stationNumber, user, onLogout }) => {
  return (
    <div className="p-8 space-y-6 h-full overflow-y-auto bg-white rounded-lg shadow-xl transition-all duration-300">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <h2 className="text-4xl font-extrabold text-blue-800 flex items-center">
          <Factory className="w-8 h-8 mr-3 text-blue-500" />
          Estasyon {stationNumber}
        </h2>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-700">Maligayang Pagdating, {user.name || 'Operator'}!</p>
          <p className="text-sm text-gray-500">{user.role || 'Tagapamahala ng Linya'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
          <h3 className="text-xl font-bold text-blue-700 mb-2">Pangkalahatang Status</h3>
          <p className="text-3xl font-extrabold text-blue-900">AKTIBO</p>
        </div>
        <div className="bg-green-50 p-6 rounded-xl shadow-inner border border-green-200">
          <h3 className="text-xl font-bold text-green-700 mb-2">Output Ngayon</h3>
          <p className="text-3xl font-extrabold text-green-900">4,850 Pcs</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-xl shadow-inner border border-yellow-200">
          <h3 className="text-xl font-bold text-yellow-700 mb-2">Mga Depekto</h3>
          <p className="text-3xl font-extrabold text-yellow-900">12</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Detalyadong Monitoring</h3>
        <p className="text-gray-600">
          Ito ang espasyo kung saan ilalagay ang mga real-time na graph, data input fields, at iba pang
          kontrol para sa Estasyon {stationNumber}. Ang mga detalye ay nag-iiba depende sa function ng bawat estasyon.
        </p>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button
          onClick={onLogout}
          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Mag-log Out
        </button>
      </div>
    </div>
  );
};

/**
 * @component App
 * @description Ang pangunahing application wrapper na nagpapatupad ng OperatorPage functionality.
 * Ito ang naghawak ng estado para sa kasalukuyang napiling estasyon.
 */
const App = () => {
  // Mock user data. Sa totoong application, galing ito sa authentication context.
  const mockUser = { id: 'op101', name: 'Juan Dela Cruz', role: 'Supervisor' };

  // Estado para subaybayan ang kasalukuyang aktibong estasyon (default: Estasyon 1)
  const [activeStation, setActiveStation] = useState(1);
  const totalStations = 15;

  const handleLogout = () => {
    console.log("Ang user ay nag-logout na.");
    // Sa totoong app, ilalagay dito ang Firebase sign-out logic.
    alert('Matagumpay kang nag-logout (Simulated)!'); 
  };
  
  // Custom alert/modal function para maiwasan ang browser's built-in alert
  const alert = (message) => {
    const modal = document.getElementById('custom-alert-modal');
    const messageElement = document.getElementById('custom-alert-message');
    if (messageElement && modal) {
      messageElement.textContent = message;
      modal.classList.remove('hidden');
    }
  };

  const closeModal = () => {
    document.getElementById('custom-alert-modal')?.classList.add('hidden');
  };


  // Array ng mga station number
  const stations = Array.from({ length: totalStations }, (_, i) => i + 1);

  return (
    <div className="flex h-screen bg-gray-50 font-sans antialiased">
      {/* Custom Alert Modal */}
      <div id="custom-alert-modal" className="fixed inset-0 z-50 bg-black bg-opacity-50 hidden flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
          <h3 className="text-xl font-bold text-blue-800 mb-4">Notification</h3>
          <p id="custom-alert-message" className="text-gray-700 mb-6"></p>
          <button
            onClick={closeModal}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
          >
            OK
          </button>
        </div>
      </div>
      
      {/* Sidebar para sa Navigation */}
      <aside className="w-64 bg-blue-900 flex flex-col shadow-2xl">
        <div className="p-6 text-white text-2xl font-bold border-b border-blue-700 flex items-center">
          <LayoutGrid className="w-6 h-6 mr-2" />
          Operator Panel
        </div>
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          <p className="text-xs font-semibold text-blue-300 uppercase px-3 py-2">Pumili ng Estasyon ({totalStations})</p>
          {stations.map((station) => (
            <button
              key={station}
              onClick={() => setActiveStation(station)}
              className={`w-full text-left px-3 py-2 rounded-lg transition duration-150 ease-in-out flex items-center ${
                activeStation === station
                  ? 'bg-blue-700 text-white shadow-lg font-bold'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <Factory className="w-4 h-4 mr-3" />
              Estasyon {station}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Mag-log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-hidden">
        {/* Render ang StationContent na may active station number */}
        <StationContent
          stationNumber={activeStation}
          user={mockUser}
          onLogout={handleLogout}
        />
      </main>
    </div>
  );
};

export default App;