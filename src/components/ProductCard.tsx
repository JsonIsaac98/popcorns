import { type ParsedSKU } from '../data/skus'
import { clsx } from 'clsx'

type Props = {
  item: ParsedSKU
  active?: boolean
  onSelect?: (item: ParsedSKU) => void
}

export default function ProductCard({ item, active, onSelect }: Props) {
  return (
    <button
      className={clsx(
        'card w-full text-left p-4 transition hover:-translate-y-0.5 hover:shadow-md',
        active && 'ring-2 ring-brand-600'
      )}
      onClick={() => onSelect?.(item)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">SKU #{item.code}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-800">{item.label}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="chip">{item.pack}</span>
          <span className="chip">{item.size}</span>
          <span className="chip">{item.flavor}</span>
        </div>
      </div>
    </button>
  )
}
