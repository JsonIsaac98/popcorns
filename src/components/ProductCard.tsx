import { type ParsedSKU } from '../data/skus'
import { clsx } from 'clsx'

type Props = {
  item: ParsedSKU
  active?: boolean
  onSelect?: (item: ParsedSKU) => void
  onAdd?: (item: ParsedSKU) => void   // <--- NUEVO
}

export default function ProductCard({ item, active, onSelect, onAdd }: Props) {
  return (
    <div
      className={clsx(
        'card w-full text-left p-4 transition hover:-translate-y-0.5 hover:shadow-md',
        active && 'ring-2 ring-brand-600'
      )}
      onClick={() => onSelect?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.(item)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500">SKU #{item.code}</p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold text-slate-800">{item.label}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="chip">{item.pack}</span>
            <span className="chip">{item.size}</span>
            <span className="chip">{item.flavor}</span>
          </div>
        </div>

        {/* Agregar rápido */}
        <button
          type="button"
          className="btn whitespace-nowrap"
          onClick={(e) => { e.stopPropagation(); onAdd?.(item) }}   // evita seleccionar al hacer click
          aria-label={`Agregar ${item.label} al carrito`}
        >
          Agregar
        </button>
      </div>
    </div>
  )
}
