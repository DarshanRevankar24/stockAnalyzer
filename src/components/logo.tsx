import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-lg font-semibold", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <TrendingUp className="h-5 w-5" />
      </div>
      <span className='group-data-[collapsible=icon]:hidden'>Stock Sensei</span>
    </div>
  );
}
