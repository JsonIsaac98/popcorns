type Props = {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}

export default function QtyInput({ value, onChange, min = 1, max = 99 }: Props) {
  const inc = () => onChange(Math.min(max, value + 1))
  const dec = () => onChange(Math.max(min, value - 1))

  return (
    <div className="inline-flex items-center rounded-2xl border border-slate-300 bg-white">
      <button type="button" className="px-3 py-2 text-lg" onClick={dec}>−</button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value || min))}
        className="w-14 border-x border-slate-200 py-2 text-center outline-none"
      />
      <button type="button" className="px-3 py-2 text-lg" onClick={inc}>＋</button>
    </div>
  )
}
