import { FolderTree } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { PageHeader } from '../_components/page-header';

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-7">
      <PageHeader title="Категории" description="Управление категориями расходов и доходов." />
      <Card
        className="reveal flex flex-col items-center gap-3 px-6 py-16 text-center"
        style={{ animationDelay: '70ms' }}
      >
        <span className="bg-muted text-muted-foreground grid size-14 place-items-center rounded-2xl">
          <FolderTree className="size-6" strokeWidth={1.75} />
        </span>
        <div className="space-y-1">
          <p className="text-foreground text-[15px] font-bold">Раздел в разработке</p>
          <p className="text-muted-foreground text-sm">
            Здесь появится управление категориями — создание, цвета и иконки.
          </p>
        </div>
      </Card>
    </div>
  );
}
