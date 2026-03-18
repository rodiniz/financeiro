import { cva, type VariantProps } from 'class-variance-authority';

export const tableVariants = cva(
  'w-full caption-bottom text-sm [&_thead_tr]:border-b [&_tbody]:border-0 [&_tbody_tr:last-child]:border-0 [&_tbody_tr]:border-b [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-muted/50 [&_tbody_tr]:data-[state=selected]:bg-muted [&_th]:h-10 [&_th]:px-2 [&_th]:text-left [&_th]:align-middle [&_th]:font-medium [&_th]:text-muted-foreground [&_th:has([role=checkbox])]:pr-0 [&_th>[role=checkbox]]:translate-y-[2px] [&_td]:p-2 [&_td]:align-middle [&_td:has([role=checkbox])]:pr-0 [&_td>[role=checkbox]]:translate-y-[2px] [&_caption]:mt-4 [&_caption]:text-sm [&_caption]:text-muted-foreground',
  {
    variants: {
      zType: {
        default: '',
        striped: '[&_tbody_tr:nth-child(odd)]:bg-muted/50',
        bordered: 'border border-border',
        light: 'bg-white text-slate-800 [&_thead]:bg-slate-50 [&_thead_tr]:border-slate-200 [&_th]:text-slate-600 [&_tbody_tr:nth-child(odd)]:bg-slate-50/50 [&_tbody_tr:hover]:bg-slate-100 [&_td]:text-slate-700 [&_tr]:border-slate-200',
      },
      zSize: {
        default: '',
        compact: '[&_td]:py-2 [&_th]:py-2',
        comfortable: '[&_td]:py-4 [&_th]:py-4',
      },
    },
    defaultVariants: {
      zType: 'default',
      zSize: 'default',
    },
  },
);

export const tableHeaderVariants = cva('[&_tr]:border-b', {
  variants: {
    zType: {
      default: '',
      striped: '',
      bordered: '',
      light: '',
    },
  },
  defaultVariants: {
    zType: 'default',
  },
});

export const tableBodyVariants = cva('[&_tr:last-child]:border-0', {
  variants: {
    zType: {
      default: '',
      striped: '',
      bordered: '',
      light: '',
    },
  },
  defaultVariants: {
    zType: 'default',
  },
});

export const tableHeadVariants = cva('h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', {
  variants: {
    zType: {
      default: '',
      striped: '',
      bordered: '',
      light: 'text-slate-600 bg-slate-50',
    },
  },
  defaultVariants: {
    zType: 'default',
  },
});

export const tableCellVariants = cva('p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', {
  variants: {
    zType: {
      default: '',
      striped: '',
      bordered: '',
      light: 'text-slate-700 border-b border-slate-200',
    },
  },
  defaultVariants: {
    zType: 'default',
  },
});

export const tableRowVariants = cva('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', {
  variants: {
    zType: {
      default: '',
      striped: '',
      bordered: '',
      light: 'border-slate-200 hover:bg-slate-100',
    },
  },
  defaultVariants: {
    zType: 'default',
  },
});

export const tableCaptionVariants = cva('mt-4 text-sm text-muted-foreground', {
  variants: {
    zType: {
      default: '',
      striped: '',
      bordered: '',
      light: '',
    },
  },
  defaultVariants: {
    zType: 'default',
  },
});

export type ZardTableVariants = VariantProps<typeof tableVariants>;
export type ZardTableHeaderVariants = VariantProps<typeof tableHeaderVariants>;
export type ZardTableBodyVariants = VariantProps<typeof tableBodyVariants>;
export type ZardTableRowVariants = VariantProps<typeof tableRowVariants>;
export type ZardTableHeadVariants = VariantProps<typeof tableHeadVariants>;
export type ZardTableCellVariants = VariantProps<typeof tableCellVariants>;
export type ZardTableCaptionVariants = VariantProps<typeof tableCaptionVariants>;
