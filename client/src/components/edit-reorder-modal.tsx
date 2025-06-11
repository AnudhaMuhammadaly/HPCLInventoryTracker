import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EditReorderModalProps {
  item: string;
  spec: string;
  currentReorderLevel: number;
  onClose: () => void;
}

export default function EditReorderModal({ item, spec, currentReorderLevel, onClose }: EditReorderModalProps) {
  const [newReorderLevel, setNewReorderLevel] = useState(currentReorderLevel.toString());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateReorderMutation = useMutation({
    mutationFn: async (data: { item: string; spec: string; reorderLevel: number }) => {
      return await apiRequest("PATCH", "/api/inventory/reorder-level", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/transactions'] });
      toast({
        title: "Reorder level updated successfully!",
        variant: "success"
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reorder level",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    const level = parseInt(newReorderLevel);
    if (isNaN(level) || level < 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid reorder level (0 or greater).",
        variant: "destructive"
      });
      return;
    }

    updateReorderMutation.mutate({
      item,
      spec,
      reorderLevel: level
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Reorder Level</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Item</Label>
            <div className="text-sm font-semibold text-gray-900">{item}</div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Specification</Label>
            <div className="text-sm font-semibold text-gray-900">{spec}</div>
          </div>
          
          <div>
            <Label htmlFor="newReorderLevel" className="text-sm font-medium text-gray-700">
              New Reorder Level
            </Label>
            <Input
              id="newReorderLevel"
              type="number"
              min="0"
              value={newReorderLevel}
              onChange={(e) => setNewReorderLevel(e.target.value)}
              className="focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updateReorderMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateReorderMutation.isPending}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            {updateReorderMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
