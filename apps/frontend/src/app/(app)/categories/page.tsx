'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Category } from '@expense-tracker/shared';
import { Button } from '@/shared/ui/button';
import { useCategories } from '@/features/categories/model/use-categories';
import { CategoriesList } from '@/features/categories/ui/categories-list';
import { CategoryFormDialog } from '@/features/categories/ui/category-form-dialog';
import { DeleteCategoryDialog } from '@/features/categories/ui/delete-category-dialog';
import { PageHeader } from '../_components/page-header';

export default function CategoriesPage() {
  const { items, isLoading, error, refresh } = useCategories();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Категории"
        description="Управление категориями расходов и доходов."
        action={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" strokeWidth={2.4} />
            Добавить категорию
          </Button>
        }
      />

      <CategoriesList
        items={items}
        isLoading={isLoading}
        error={error}
        onEdit={setEditing}
        onDelete={setDeleting}
      />

      <CategoryFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={refresh}
      />

      <CategoryFormDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        onSaved={refresh}
        category={editing ?? undefined}
      />

      <DeleteCategoryDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onDeleted={refresh}
        category={deleting}
      />
    </div>
  );
}
