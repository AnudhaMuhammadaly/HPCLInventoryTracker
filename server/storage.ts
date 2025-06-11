import { 
  type InsertInventoryTransaction, 
  type InventoryTransaction,
  type InsertVendor,
  type Vendor 
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private inventoryTransactions: Map<number, InventoryTransaction>;
  private vendors: Map<number, Vendor>;
  private currentTransactionId: number;
  private currentVendorId: number;

  constructor() {
    this.inventoryTransactions = new Map();
    this.vendors = new Map();
    this.currentTransactionId = 1;
    this.currentVendorId = 1;

    // Initialize with some default vendors
    this.initializeDefaultVendors();
  }

  private initializeDefaultVendors() {
    const defaultVendors = [
      { name: 'Larsen & Toubro', address: 'Mumbai, Maharashtra', phone: '+91 22 6752 5656', email: 'contact@larsentoubro.com' },
      { name: 'Tata Steel', address: 'Jamshedpur, Jharkhand', phone: '+91 657 665 4444', email: 'info@tatasteel.com' },
      { name: 'BHEL', address: 'New Delhi', phone: '+91 11 2610 6151', email: 'contact@bhel.in' },
      { name: 'Thermax', address: 'Pune, Maharashtra', phone: '+91 20 6601 2345', email: 'info@thermaxglobal.com' }
    ];

    defaultVendors.forEach(vendor => {
      const id = this.currentVendorId++;
      const vendorWithId: Vendor = {
        ...vendor,
        id,
        createdAt: new Date()
      };
      this.vendors.set(id, vendorWithId);
    });
  }

  // Inventory transactions
  async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    return Array.from(this.inventoryTransactions.values());
  }

  async createInventoryTransaction(insertTransaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const id = this.currentTransactionId++;
    const transaction: InventoryTransaction = {
      ...insertTransaction,
      id,
      createdAt: new Date()
    };
    this.inventoryTransactions.set(id, transaction);
    return transaction;
  }

  async updateReorderLevel(item: string, spec: string, reorderLevel: number): Promise<void> {
    // Update all transactions with this item/spec combination
    for (const transaction of this.inventoryTransactions.values()) {
      if (transaction.item === item && transaction.spec === spec) {
        transaction.reorderLevel = reorderLevel;
      }
    }
  }

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = this.currentVendorId++;
    const vendor: Vendor = {
      ...insertVendor,
      id,
      createdAt: new Date()
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async updateVendor(id: number, vendorUpdate: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;

    const updatedVendor = { ...vendor, ...vendorUpdate };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async deleteVendor(id: number): Promise<boolean> {
    return this.vendors.delete(id);
  }
}

export const storage = new MemStorage();
