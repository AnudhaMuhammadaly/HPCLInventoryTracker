import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { calculateCurrentStock } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Vendor, InventoryTransaction } from "@shared/schema";

export default function InventoryForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    itemName: '',
    matSpec: '',
    quantity: '',
    reorderLevel: ''
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors']
  });

  const { data: transactions = [] } = useQuery<InventoryTransaction[]>({
    queryKey: ['/api/inventory/transactions']
  });

  const transactionMutation = useMutation({
    mutationFn: async (data: { type: string; formData: any }) => {
      const transactionData = {
        date: data.formData.date,
        vendor: data.formData.vendor,
        item: data.formData.itemName.trim().toUpperCase(),
        spec: data.formData.matSpec.trim().toUpperCase(),
        quantity: parseInt(data.formData.quantity),
        reorderLevel: parseInt(data.formData.reorderLevel),
        type: data.type
      };
      return await apiRequest("POST", "/api/inventory/transactions", transactionData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/transactions'] });
      toast({
        title: `${variables.type} transaction recorded successfully!`,
        variant: "success"
      });
      setFormData({
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        itemName: '',
        matSpec: '',
        quantity: '',
        reorderLevel: ''
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record transaction",
        variant: "destructive"
      });
    }
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (type: 'IN' | 'OUT') => {
    // Validation
    if (!formData.date || !formData.vendor.trim() || !formData.itemName.trim() || 
        !formData.matSpec.trim() || !formData.quantity || !formData.reorderLevel) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields correctly.",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseInt(formData.quantity);
    const reorderLevel = parseInt(formData.reorderLevel);

    if (isNaN(quantity) || quantity <= 0 || isNaN(reorderLevel) || reorderLevel < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter valid numbers for quantity and reorder level.",
        variant: "destructive"
      });
      return;
    }

    // Check stock for OUT transactions
    if (type === 'OUT') {
      const currentStock = calculateCurrentStock(
        transactions, 
        formData.itemName.trim().toUpperCase(), 
        formData.matSpec.trim().toUpperCase()
      );
      
      if (currentStock < quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Current stock: ${currentStock}. Cannot process OUT transaction.`,
          variant: "destructive"
        });
        return;
      }
    }

    transactionMutation.mutate({ type, formData });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-hpcl-dark text-center">
          Inventory Transaction Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <Label htmlFor="vendor">Vendor Name</Label>
            <Select value={formData.vendor} onValueChange={(value) => handleChange('vendor', value)}>
              <SelectTrigger className="focus:ring-2 focus:ring-orange-500">
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.name}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              placeholder="Enter item name"
              value={formData.itemName}
              onChange={(e) => handleChange('itemName', e.target.value)}
              className="focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <Label htmlFor="matSpec">Material Specification</Label>
            <Input
              id="matSpec"
              placeholder="Enter specification"
              value={formData.matSpec}
              onChange={(e) => handleChange('matSpec', e.target.value)}
              className="focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              className="focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <Label htmlFor="reorderLevel">Reorder Level</Label>
            <Input
              id="reorderLevel"
              type="number"
              min="0"
              placeholder="Enter reorder level"
              value={formData.reorderLevel}
              onChange={(e) => handleChange('reorderLevel', e.target.value)}
              className="focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <Button
            onClick={() => handleSubmit('IN')}
            className="bg-green-600 text-white px-8 py-3 hover:bg-green-700 flex items-center"
            disabled={transactionMutation.isPending}
          >
            <ArrowDown className="w-4 h-4 mr-2" />
            IN
          </Button>
          <Button
            onClick={() => handleSubmit('OUT')}
            className="bg-red-600 text-white px-8 py-3 hover:bg-red-700 flex items-center"
            disabled={transactionMutation.isPending}
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            OUT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
