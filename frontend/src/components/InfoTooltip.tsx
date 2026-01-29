import * as Tooltip from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  /** Optional label for screen readers */
  label?: string;
}

export function InfoTooltip({ content, label = 'More info' }: InfoTooltipProps) {
  return (
    <Tooltip.Root delayDuration={300}>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          className="ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <Info className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={8}
          className="z-[9999] max-w-[220px] rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-normal normal-case text-slate-200 shadow-xl"
        >
          {content}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
