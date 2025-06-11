import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUniqueItems } from "@/lib/utils";
import { Edit, AlertTriangle } from "lucide-react";
import EditReorderModal from "@/components/edit-reorder-modal";
import { useState } from "react";
import type { InventoryTransaction } from "@shared/schema";

export default function SummaryView() {
  const [editItem, setEditItem] = useState<{item: string, spec: string, reorderLevel: number} | null>(null);

  const { data: transactions = [], isLoading } = useQuery<InventoryTransaction[]>({
    queryKey: ['/api/inventory/transactions']
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading summary...</div>;
  }

  const summaryData = getUniqueItems(transactions);
  const lowStockItems = summaryData.filter(item => item.currentStock <= item.reorderLevel);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-hpcl-dark">
              Inventory Summary
            </CardTitle>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Total Items: <span className="font-semibold">{summaryData.length}</span>
              </span>
              <span className="text-sm text-gray-600">
                Low Stock Alerts: <span className="font-semibold text-red-600">{lowStockItems.length}</span>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Reorder Alerts */}
          {lowStockItems.length > 0 && (
            <div className="mb-6 space-y-2">
              {lowStockItems.map((item, index) => (
                <Alert key={index} className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    <strong>Reorder Alert:</strong> {item.item} ({item.spec}) - 
                    Current Stock: {item.currentStock}, Reorder Level: {item.reorderLevel}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Summary Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Item Name</TableHead>
                  <TableHead>Material Specification</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No inventory items found. Add some transactions to see the summary.
                    </TableCell>
                  </TableRow>
                ) : (
                  summaryData.map((item, index) => {
                    const isLowStock = item.currentStock <= item.reorderLevel;
                    return (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.item}</TableCell>
                        <TableCell>{item.spec}</TableCell>
                        <TableCell>{item.currentStock}</TableCell>
                        <TableCell>{item.reorderLevel}</TableCell>
                        <TableCell>
                          <Badge variant={isLowStock ? "destructive" : "default"}>
                            {isLowStock ? "Low Stock" : "In Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditItem({
                              item: item.item,
                              spec: item.spec,
                              reorderLevel: item.reorderLevel
                            })}
                            className="text-orange-500 hover:text-orange-600"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editItem && (
        <EditReorderModal
          item={editItem.item}
          spec={editItem.spec}
          currentReorderLevel={editItem.reorderLevel}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}
