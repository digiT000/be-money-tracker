export interface FilterExpense {
  categoryId?: string;
  ownerId?: string;
}
export interface SortExpense {
  sortBased: 'amount' | 'date';
  sortType: 'asc' | 'desc';
}

export interface ExpenseCreateModel {
  totalExpense: number;
  categoryId: string;
  description: string;
  ownerId: string;
}

export interface UpdateExpenseModel {
  totalExpense?: number;
  categoryId?: string;
  description?: string;
  ownerId?: string;
}
