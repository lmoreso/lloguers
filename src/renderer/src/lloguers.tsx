import { AppShell, NavLink, Title } from '@mantine/core'
import { HashRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SelectorIdioma from './components/SelectorIdioma'
import Inquilins from './pantalles/Inquilins'
import Immobles from './pantalles/Immobles'
import FitxaImmoble from './pantalles/FitxaImmoble'
import Contractes from './pantalles/Contractes'
import FitxaContracte from './pantalles/FitxaContracte'
import UltimsContractes from './pantalles/UltimsContractes'

const SECCIONS = [
  { ruta: '/immobles', clau: 'menu.immobles' },
  { ruta: '/ultims-contractes', clau: 'menu.ultimsContractes' },
  { ruta: '/inquilins', clau: 'menu.inquilins' },
  { ruta: '/configuracio', clau: 'menu.configuracio' },
  { ruta: '/quant-a', clau: 'menu.quantA' }
] as const

function Estructura(): React.JSX.Element {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <AppShell navbar={{ width: 220, breakpoint: 'xs' }} padding="md">
      <AppShell.Navbar p="md">
        <Title order={4} mb="md">
          {t('app.titol')}
        </Title>
        {SECCIONS.map((s) => (
          <NavLink
            key={s.ruta}
            component={Link}
            to={s.ruta}
            label={t(s.clau)}
            active={pathname === s.ruta || pathname.startsWith(`${s.ruta}/`)}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Navigate to="/immobles" replace />} />
          <Route path="/immobles" element={<Immobles />} />
          <Route path="/immobles/nou" element={<FitxaImmoble key="nou" />} />
          <Route path="/immobles/:id" element={<FitxaImmoble key="edicio" />} />
          <Route path="/immobles/:id/contractes" element={<Contractes />} />
          <Route path="/immobles/:id/contractes/nou" element={<FitxaContracte key="nou" />} />
          <Route path="/ultims-contractes" element={<UltimsContractes />} />
          <Route
            path="/immobles/:id/contractes/:idContracte"
            element={<FitxaContracte key="edicio" />}
          />
          <Route path="/inquilins" element={<Inquilins />} />
          <Route
            path="/configuracio"
            element={
              <>
                <Title order={2} mb="md">
                  {t('configuracio.titol')}
                </Title>
                <SelectorIdioma />
              </>
            }
          />
          <Route path="/quant-a" element={<Title order={2}>{t('quantA.titol')}</Title>} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}

// HashRouter: l'app empaquetada es carrega des d'un fitxer (file://), on BrowserRouter no funciona.
function Lloguers(): React.JSX.Element {
  return (
    <HashRouter>
      <Estructura />
    </HashRouter>
  )
}

export default Lloguers
