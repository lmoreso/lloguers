import { AppShell, Group, NavLink, Text, Title, UnstyledButton } from '@mantine/core'
import { HashRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Inquilins from './pantalles/Inquilins'
import Immobles from './pantalles/Immobles'
import FitxaImmoble from './pantalles/FitxaImmoble'
import Contractes from './pantalles/Contractes'
import FitxaContracte from './pantalles/FitxaContracte'
import UltimsContractes from './pantalles/UltimsContractes'
import QuantA from './pantalles/QuantA'
import DocumentsImmoble from './pantalles/DocumentsImmoble'
import DocumentsContracte from './pantalles/DocumentsContracte'
import RevisionsContracte from './pantalles/RevisionsContracte'
import Revisions from './pantalles/Revisions'
import Configuracio from './pantalles/Configuracio'
import { useEffect, useState } from 'react'
import { PosicioMenu } from '../../shared/tipus'
import { esPosicioMenu } from '../../shared/validacions'

const SECCIONS = [
  { ruta: '/ultims-contractes', clau: 'menu.ultimsContractes' },
  { ruta: '/immobles', clau: 'menu.immobles' },
  { ruta: '/revisions', clau: 'menu.revisions' },
  { ruta: '/inquilins', clau: 'menu.inquilins' },
  { ruta: '/configuracio', clau: 'menu.configuracio' },
  { ruta: '/quant-a', clau: 'menu.quantA' }
] as const

interface EstructuraProps {
  posMenu: PosicioMenu
  onCanviarPosMenu: (posicio: PosicioMenu) => void
}

function Estructura({ posMenu, onCanviarPosMenu }: EstructuraProps): React.JSX.Element {
  const { t } = useTranslation()

  if (posMenu === 'top') {
    return (
      <AppShell header={{ height: 60 }} padding="md">
        <AppShell.Header px="md">
          <Group h="100%" gap="xl" wrap="nowrap">
            <Title order={4}>{t('app.titol')}</Title>

            <Group gap="md" wrap="nowrap">
              {SECCIONS.map((s) => (
                <UnstyledButton key={s.ruta} component={Link} to={s.ruta}>
                  <Text size="sm">{t(s.clau)}</Text>
                </UnstyledButton>
              ))}
            </Group>
          </Group>
        </AppShell.Header>
        <Rutas />
      </AppShell>
    )
  } else {
    return (
      <AppShell navbar={{ width: 220, breakpoint: 'xs' }} padding="md">
        <AppShell.Navbar p="md">
          <Title order={4} mb="md">
            {t('app.titol')}
          </Title>
          {SECCIONS.map((s) => (
            <NavLink key={s.ruta} component={Link} to={s.ruta} label={t(s.clau)} />
          ))}
        </AppShell.Navbar>
        <Rutas />
      </AppShell>
    )
  }

  function Rutas(): React.JSX.Element {
    return (
      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Navigate to="/ultims-contractes" replace />} />
          <Route path="/immobles" element={<Immobles />} />
          <Route path="/immobles/nou" element={<FitxaImmoble key="nou" />} />
          <Route path="/immobles/:id" element={<FitxaImmoble key="edicio" />} />
          <Route path="/immobles/:id/contractes" element={<Contractes />} />
          <Route path="/immobles/:id/contractes/nou" element={<FitxaContracte key="nou" />} />
          <Route path="/immobles/:id/documents" element={<DocumentsImmoble />} />
          <Route path="/ultims-contractes" element={<UltimsContractes />} />
          <Route path="/revisions" element={<Revisions />} />
          <Route
            path="/immobles/:id/contractes/:idContracte"
            element={<FitxaContracte key="edicio" />}
          />
          <Route
            path="/immobles/:id/contractes/:idContracte/documents"
            element={<DocumentsContracte />}
          />
          <Route
            path="/immobles/:id/contractes/:idContracte/revisions"
            element={<RevisionsContracte />}
          />
          <Route path="/inquilins" element={<Inquilins />} />
          <Route
            path="/configuracio"
            element={<Configuracio posicioMenu={posMenu} onCanviarPosMenu={onCanviarPosMenu} />}
          />
          <Route path="/quant-a" element={<QuantA />} />
        </Routes>
      </AppShell.Main>
    )
  }
}

// HashRouter: l'app empaquetada es carrega des d'un fitxer (file://), on BrowserRouter no funciona.
function Lloguers(): React.JSX.Element {
  const [posicioMenu, setPosicioMenu] = useState<PosicioMenu>('top')

  useEffect(() => {
    const carregarConfig = async (): Promise<void> => {
      const resultat = await window.api.config.obtenir()

      if (resultat.ok && esPosicioMenu(resultat.dades.posicioMenu)) {
        setPosicioMenu(resultat.dades.posicioMenu)
      }
    }

    void carregarConfig()
  }, [])
  return (
    <HashRouter>
      <Estructura posMenu={posicioMenu} onCanviarPosMenu={setPosicioMenu} />{' '}
    </HashRouter>
  )
}

export default Lloguers
