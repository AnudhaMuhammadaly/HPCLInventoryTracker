import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { calculateRunningTotal, formatDate } from "@/lib/utils";
import type { InventoryTransaction } from "@shared/schema";

export default function DetailedInventory() {
  const [searchFilter, setSearchFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: transactions = [], isLoading } = useQuery<InventoryTransaction[]>({
    queryKey: ['/api/inventory/transactions']
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading detailed inventory...</div>;
  }

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter transactions
  const filteredTransactions = sortedTransactions.filter(transaction => {
    const matchesSearch = searchFilter === "" || 
      transaction.item.toLowerCase().includes(searchFilter.toLowerCase()) ||
      transaction.vendor.toLowerCase().includes(searchFilter.toLowerCase()) ||
      transaction.spec.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesType = typeFilter === "" || transaction.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-hpcl-dark">
            Detailed Inventory Transactions
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search items..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-64 focus:ring-2 focus:ring-orange-500"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48 focus:ring-2 focus:ring-orange-500">
                <SelectValue placeholder="All Transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Transactions</SelectItem>
                <SelectItem value="IN">IN Only</SelectItem>
                <SelectItem value="OUT">OUT Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Specification</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Running Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {transactions.length === 0 
                      ? "No transactions found. Add some inventory transactions to see them here."
                      : "No transactions match your current filters."
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => {
                  const runningTotal = calculateRunningTotal(
                    transactions,
                    transaction.item,
                    transaction.spec,
                    transaction.date
                  );
                  
                  return (
                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.vendor}</TableCell>
                      <TableCell className="font-medium">{transaction.item}</TableCell>
                      <TableCell>{transaction.spec}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'IN' ? 'default' : 'destructive'}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{runningTotal}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
