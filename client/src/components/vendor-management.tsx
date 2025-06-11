import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, MapPin, Phone, Mail } from "lucide-react";
import AddVendorModal from "@/components/add-vendor-modal";
import type { Vendor, InventoryTransaction } from "@shared/schema";

export default function VendorManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors']
  });

  const { data: transactions = [] } = useQuery<InventoryTransaction[]>({
    queryKey: ['/api/inventory/transactions']
  });

  const deleteVendorMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/vendors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      toast({
        title: "Vendor deleted successfully!",
        variant: "success"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive"
      });
    }
  });

  const handleDeleteVendor = (vendor: Vendor) => {
    // Check if vendor has transactions
    const vendorTransactions = transactions.filter(t => t.vendor === vendor.name);
    if (vendorTransactions.length > 0) {
      toast({
        title: "Cannot delete vendor",
        description: `This vendor has ${vendorTransactions.length} transaction(s). Remove transactions first.`,
        variant: "destructive"
      });
      return;
    }

    if (confirm(`Are you sure you want to delete ${vendor.name}?`)) {
      deleteVendorMutation.mutate(vendor.id);
    }
  };

  const getTransactionCount = (vendorName: string) => {
    return transactions.filter(t => t.vendor === vendorName).length;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading vendors...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-hpcl-dark">
              Vendor Management
            </CardTitle>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-500 text-white hover:bg-orange-600 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No vendors found. Add a vendor to get started.
              </div>
            ) : (
              vendors.map((vendor) => {
                const transactionCount = getTransactionCount(vendor.name);
                
                return (
                  <Card key={vendor.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-hpcl-dark">{vendor.name}</h3>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingVendor(vendor)}
                            className="text-orange-500 hover:text-orange-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVendor(vendor)}
                            className="text-red-500 hover:text-red-600"
                            disabled={deleteVendorMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{vendor.address}</span>
                        </div>
                        {vendor.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{vendor.phone}</span>
                          </div>
                        )}
                        {vendor.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            <span>{vendor.email}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Total Transactions: <span className="font-semibold">{transactionCount}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {showAddModal && (
        <AddVendorModal
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingVendor && (
        <AddVendorModal
          vendor={editingVendor}
          onClose={() => setEditingVendor(null)}
        />
      )}
    </div>
  );
}
