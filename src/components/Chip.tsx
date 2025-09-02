import { clsx } from 'clsx'

type Props = {
  label: string
  active?: boolean
  onClick?: () => void
}

export default function Chip({ label, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx('chip', active && 'chip-active')}
      type="button"
    >
      {label}
    </button>
  )
}
