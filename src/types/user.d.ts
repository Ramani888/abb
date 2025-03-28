type AuthorizedRequest = Express.Request & ?({ headers: { authorization: string } } & ?{ userData: JwtSign });

declare namespace Express {
  type Request = AuthorizedRequest;
}
export interface IShop {
  _id?: ObjectId;
  name: string;
  address: string;
  number: number;
  email: string;
  gst: string;
}

export interface IOwner {
  _id?: ObjectId;
  name: string;
  email: string;
  number: number;
  password: string;
  shop: IShop;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser {
  _id?: ObjectId;
  name: string;
  email: string;
  number: number;
  createdAt?: Date;
  updatedAt?: Date;
}