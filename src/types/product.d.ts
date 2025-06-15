export interface IVariant {
  _id?: string;
  unit: string;
  packingSize: string;
  sku: string;
  barcode: string;
  mrp: number;
  retailPrice: number;
  wholesalePrice: number;
  purchasePrice: number;
  minStockLevel: number;
  taxRate: number;
  quantity: number;
  status?: string;
}

export interface IProduct {
  _id?: string;
  ownerId?: string;
  userId?: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  description?: string;
  variants: IVariant[];
  variantsCount: number;
  captureDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStockLog {
  _id?: string;
  ownerId: string;
  userId: string;
  productId: string;
  variantId: string;
  quantity: number;
  type: string;
  quantity: number; // +ve for add, -ve for subtract
  balanceAfter: number; // stock level after this change
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}