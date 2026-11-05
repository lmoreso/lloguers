// Hi ha una finestra (modal) o un desplegable (calendari, selector...) OBERT i visible? Els desplegables de Mantine
// poden quedar muntats i amagats al DOM després d'obrir-los: només compten els que es veuen de debò.
export function hiHaCapaOberta(): boolean {
  const candidats = document.querySelectorAll<HTMLElement>(
    '[role="dialog"], .mantine-Popover-dropdown'
  )
  return Array.from(candidats).some((el) => {
    const estil = window.getComputedStyle(el)
    return (
      estil.display !== 'none' && estil.visibility !== 'hidden' && el.getClientRects().length > 0
    )
  })
}
