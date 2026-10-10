import { AppShell, NavLink, Title } from '@mantine/core'
import { HashRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SelectorIdioma from './components/SelectorIdioma'

const SECCIONS = [
  { ruta: '/immobles', clau: 'menu.immobles' },
  { ruta: '/inquilins', clau: 'menu.inquilins' },
  { ruta: '/contractes', clau: 'menu.contractes' },
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
            active={pathname === s.ruta}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Navigate to="/immobles" replace />} />
          <Route path="/immobles" element={<Title order={2}>{t('menu.immobles')}</Title>} />
          <Route path="/inquilins" element={<Title order={2}>{t('menu.inquilins')}</Title>} />
          <Route path="/contractes" element={<Title order={2}>{t('menu.contractes')}</Title>} />
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
