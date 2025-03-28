export interface IShop {
  _id?: ObjectId;
  name: string;
  address: string;
  number: number;
  email: string;
  gst: string;
  createdAt?: Date;
  updatedAt?: Date;
}