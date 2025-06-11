import { 
  type InsertInventoryTransaction, 
  type InventoryTransaction,
  type InsertVendor,
  type Vendor,
  inventoryTransactions,
  vendors
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Inventory transactions
  getInventoryTransactions(): Promise<InventoryTransaction[]>;
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
  updateReorderLevel(item: string, spec: string, reorderLevel: number): Promise<void>;
  
  // Vendors
  getVendors(): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    return await db.select().from(inventoryTransactions);
  }

  async createInventoryTransaction(insertTransaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const [transaction] = await db
      .insert(inventoryTransactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updateReorderLevel(item: string, spec: string, reorderLevel: number): Promise<void> {
    await db
      .update(inventoryTransactions)
      .set({ reorderLevel })
      .where(
        and(
          eq(inventoryTransactions.item, item),
          eq(inventoryTransactions.spec, spec)
        )
      );
  }

  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db
      .insert(vendors)
      .values(insertVendor)
      .returning();
    return vendor;
  }

  async updateVendor(id: number, vendorUpdate: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [vendor] = await db
      .update(vendors)
      .set(vendorUpdate)
      .where(eq(vendors.id, id))
      .returning();
    return vendor || undefined;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db
      .delete(vendors)
      .where(eq(vendors.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
