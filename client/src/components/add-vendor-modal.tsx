import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Vendor } from "@shared/schema";

interface AddVendorModalProps {
  vendor?: Vendor;
  onClose: () => void;
}

export default function AddVendorModal({ vendor, onClose }: AddVendorModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!vendor;

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        address: vendor.address,
        phone: vendor.phone || '',
        email: vendor.email || ''
      });
    }
  }, [vendor]);

  const vendorMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isEditing) {
        return await apiRequest("PATCH", `/api/vendors/${vendor!.id}`, data);
      } else {
        return await apiRequest("POST", "/api/vendors", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      toast({
        title: `Vendor ${isEditing ? 'updated' : 'added'} successfully!`,
        variant: "success"
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} vendor`,
        variant: "destructive"
      });
    }
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.address.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in required fields (Name and Address).",
        variant: "destructive"
      });
      return;
    }

    vendorMutation.mutate(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="vendorName" className="text-sm font-medium text-gray-700">
              Vendor Name *
            </Label>
            <Input
              id="vendorName"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="vendorAddress" className="text-sm font-medium text-gray-700">
              Address *
            </Label>
            <Textarea
              id="vendorAddress"
              rows={3}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="vendorPhone" className="text-sm font-medium text-gray-700">
              Phone
            </Label>
            <Input
              id="vendorPhone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <Label htmlFor="vendorEmail" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="vendorEmail"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </form>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={vendorMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={vendorMutation.isPending}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            {vendorMutation.isPending 
              ? (isEditing ? "Updating..." : "Adding...") 
              : (isEditing ? "Update Vendor" : "Add Vendor")
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
