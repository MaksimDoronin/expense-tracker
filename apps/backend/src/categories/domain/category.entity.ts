/** Публичное представление категории расходов, возвращаемое API. */
export interface PublicCategory {
  id: string;
  name: string;
  /** Цвет в формате hex (например `#ff0000`). */
  color: string;
  /** Идентификатор иконки. */
  icon: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
