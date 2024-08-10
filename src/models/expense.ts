import { Category } from "./category";

export interface Expense {
  _id: string;
  description: string;
  amount: number;
  date: Date;
  userId: string;
  categoryId: string;
}
