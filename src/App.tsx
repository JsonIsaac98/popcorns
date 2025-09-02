import { useEffect, useMemo, useRef, useState } from 'react'
import { PARSED, type ParsedSKU } from './data/skus'
import Chip from './components/Chip'
import ProductCard from './components/ProductCard'
import QtyInput from './components/QtyInput'
import Ticket from './components/Ticket'
import { useReactToPrint } from 'react-to-print'

type Pack = 'TODOS' | 'BOLSA' | 'LATA' | 'COMBINACIÓN'
type Size = 'TODOS' | 'CH' | 'GDE' | 'CHICA' | 'GRANDE' | '2X1'

export default function App() {
  const [query, setQuery] = useState('')
  const [pack, setPack] = useState<Pack>('TODOS')
  const [size, setSize] = useState<Size>('TODOS')
  const [selected, setSelected] = useState<ParsedSKU | null>(null)
  const [qty, setQty] = useState(1)

  const list = useMemo(() => {
  const raw = query.trim()
  const text = raw.toUpperCase()
  const digits = raw.replace(/\D/g, '') // para buscar por código

  const exact = digits ? PARSED.find(p => p.code === digits) : undefined
  if (exact) return [exact]

  // filtrado básico
  const filtered = PARSED.filter(p => {
    const inText =
      !text ||
      p.label.includes(text) ||
      p.flavor.includes(text) ||
      (!!digits && p.code.includes(digits))  // <-- aquí buscamos por código

    const okPack = pack === 'TODOS' || p.pack === pack
    const okSize = size === 'TODOS' || p.size === size
    return inText && okPack && okSize
  })

  // ranking: exact code match > startsWith code > label match
  return filtered.sort((a, b) => {
    const aExact = digits && a.code === digits ? 1 : 0
    const bExact = digits && b.code === digits ? 1 : 0
    if (aExact !== bExact) return bExact - aExact

    const aStarts = digits && a.code.startsWith(digits) ? 1 : 0
    const bStarts = digits && b.code.startsWith(digits) ? 1 : 0
    if (aStarts !== bStarts) return bStarts - aStarts

    // como desempate, por label
    return a.label.localeCompare(b.label, 'es')
  })
}, [query, pack, size])


  const ticketRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
  searchInputRef.current?.focus()
}, [])


  const handlePrint = useReactToPrint({
  contentRef: ticketRef,
  documentTitle: `ticket-${selected?.code || 'demo'}`,
})

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 p-6 md:grid-cols-[1.6fr_.9fr]">
      {/* Header */}
      <header className="col-span-full flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-800">
          🍿 Popcorn
        </h1>
        <div className="no-print">
          <button className="btn" onClick={handlePrint}>
            Imprimir ticket
          </button>
        </div>
      </header>

      {/* Left: product browser */}
      <section className="no-print space-y-4">
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={searchInputRef}
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-2 outline-none ring-brand-600 focus:ring-2"
              placeholder="Buscar por sabor, etiqueta o código…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const found = PARSED.find(p => p.code === query.trim())
                  if (found) setSelected(found)
                }
              }}
            />
            <div className="flex items-center gap-2">
              {(['TODOS','BOLSA','LATA','COMBINACIÓN'] as Pack[]).map(p => (
                <Chip key={p} label={p} active={pack === p} onClick={() => setPack(p)} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {(['TODOS','CH','GDE','CHICA','GRANDE','2X1'] as Size[]).map(s => (
                <Chip key={s} label={s} active={size === s} onClick={() => setSize(s)} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(item => (
            <ProductCard
              key={item.code}
              item={item}
              active={selected?.code === item.code}
              onSelect={setSelected}
            />
          ))}
        </div>
      </section>

      {/* Right: ticket preview */}
      <aside className="space-y-4">
        <div className="card p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Detalle</h2>
          {selected ? (
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-slate-500">Producto seleccionado</p>
                <p className="font-medium">{selected.label}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Cantidad</span>
                <QtyInput value={qty} onChange={setQty} />
              </div>
              <p className="text-xs text-slate-500">
                #{selected.code} • {selected.pack} • {selected.size} • {selected.flavor}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Selecciona un artículo para generar el ticket.</p>
          )}
        </div>

        <div className="card p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Ticket</h2>
          <Ticket
            ref={ticketRef}
            skuCode={selected?.code}
            title={selected?.label}
            qty={qty}
            price={selected?.price}
          />
        </div>
      </aside>
    </div>
  )
}
