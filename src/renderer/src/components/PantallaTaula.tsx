interface Props {
  // La part fixa de dalt: títol, botons, filtres, missatges...
  capcalera: React.ReactNode
  // La taula. Només aquesta zona fa scroll; els títols de les columnes es queden fixos (`stickyHeader`).
  children: React.ReactNode
  // Referencia al div inferior (children), per tal de reiniciar l'scroll quan convingui (al canvi de Tab, per exemple).
  refScroll?: React.RefObject<HTMLDivElement | null>
}

// Pantalla de llista amb la capçalera i els títols de les columnes fixos: només el contingut de la taula fa scroll.
// Ocupa l'alçada de la finestra (menys el padding de l'AppShell); la capçalera té l'alçada que necessiti i la
// taula, la resta. La taula ha de portar `stickyHeader`.
function PantallaTaula({ capcalera, children, refScroll }: Props): React.JSX.Element {
  return (
    <div
      style={{
        height: 'calc(100dvh - 2 * var(--mantine-spacing-md))',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div>{capcalera}</div>
      {refScroll ? (
        <div ref={refScroll} style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {children}
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{children}</div>
      )}
    </div>
  )
}

export default PantallaTaula
