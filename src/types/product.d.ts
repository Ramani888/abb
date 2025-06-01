// export interface IProduct {
//     _id?: string;
//     ownerId: string;
//     userId: string;
//     name: string;
//     categoryId: string;
//     unit: string;
//     description: string;
//     sku: string;
//     barcode: string;
//     retailPrice: number;
//     wholesalePrice: number;
//     purchasePrice: number;
//     quantity: number;
//     minStockLevel: number;
//     taxRate: number;
//     packingSize?: string;
//     isDeleted?: boolean;
//     createdAt?: Date;
//     updatedAt?: Date;
// }

export interface IVariant {
  _id?: string;
  packingSize: string;
  sku: string;
  barcode: string;
  retailPrice: number;
  wholesalePrice: number;
  purchasePrice: number;
  minStockLevel: number;
  taxRate: number;
  quantity: number;
}

export interface IProduct {
  _id?: string;
  ownerId?: string;
  userId?: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  unit: string;
  description?: string;
  variants: IVariant[];
  createdAt?: Date;
  updatedAt?: Date;
}