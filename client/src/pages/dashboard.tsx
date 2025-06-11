import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Factory, LogOut, Plus, BarChart3, List, Truck } from "lucide-react";
import InventoryForm from "@/components/inventory-form";
import SummaryView from "@/components/summary-view";
import DetailedInventory from "@/components/detailed-inventory";
import VendorManagement from "@/components/vendor-management";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    setLocation("/");
  };

  const tabs = [
    { id: "inventory", label: "Add Inventory", icon: Plus },
    { id: "summary", label: "Summary", icon: BarChart3 },
    { id: "detailed", label: "Detailed Inventory", icon: List },
    { id: "vendors", label: "Vendors", icon: Truck },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "inventory":
        return <InventoryForm />;
      case "summary":
        return <SummaryView />;
      case "detailed":
        return <DetailedInventory />;
      case "vendors":
        return <VendorManagement />;
      default:
        return <InventoryForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Factory className="text-white text-xl w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-hpcl-dark">HPCL Maintenance Store</h1>
                <p className="text-sm text-gray-600">Kochi LPG Plant - Inventory Management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-500"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
