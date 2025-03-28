type AuthorizedRequest = Express.Request & ?({ headers: { authorization: string } } & ?{ userData: JwtSign });

declare namespace Express {
  type Request = AuthorizedRequest;
}

export type UserJwt = {
    firstName?: string;
    lastName?: string;
    id?: number;
    roleId: number;
    customerId: number;
    dataModelId: number;
    exp?: number;
};

export interface IUser {
  _id?: ObjectId;
  email?: string;
  userName?: string;
  password?: string;
  picture?: string;
  isPrivacy?: boolean;
}

export interface ISupport {
  _id?: ObjectId;
  supportType: string;
  userId: string;
  image?: string;
}

export interface IUserCredit {
  _id?: ObjectId;
  userId: string;
  credit: number;
}

export interface IUserCreditLogs {
  _id?: ObjectId;
  userId: string;
  creditBalance: number;
  type: string;
  note?: string;
}

export interface IUserStorage {
  _id?: ObjectId;
  userId: string;
  storage: number;
  unit: string;
  coveredStorage?: number;
  coveredStorageUnit?: string;
}

export interface IUserStorageLogs {
  _id?: ObjectId;
  userId: string;
  documentId?: string;
  storage: number;
  unit: string;
  type: string;
  note?: string;
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