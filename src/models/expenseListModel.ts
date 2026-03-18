export interface ExpenseListModel {
  _id: string;
  description: string;
  amount: number;
  date: Date;
  userId: string;
  category: string;
  recurrent: boolean;
}
