// src/types/user.ts
import { ObjectId } from "mongodb";

export interface IUser {
  _id?: ObjectId;
  email: string; // The unique lowercase email address
  password: string; // The secure, hashed password string
  createdAt: Date; // System tracking timeline coordinate
}
