import { AppShell, Group, NavLink, Text, Title, UnstyledButton, Box } from '@mantine/core'
import { IconLogout } from '@tabler/icons-react'
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
import { Config, ConfigObtinguda } from '../../shared/tipus'

const SECCIONS = [
  { ruta: '/ultims-contractes', clau: 'menu.ultimsContractes' },
  { ruta: '/immobles', clau: 'menu.immobles' },
  { ruta: '/revisions', clau: 'menu.revisions' },
  { ruta: '/inquilins', clau: 'menu.inquilins' },
  { ruta: '/configuracio', clau: 'menu.configuracio' },
  { ruta: '/quant-a', clau: 'menu.quantA' }
] as const

interface RutasProps {
  config: ConfigObtinguda
  onCanviarConfig: (canvis: Partial<Config>) => void
}

function Rutas({ config, onCanviarConfig }: RutasProps): React.JSX.Element {
  return (
    <AppShell.Main>
      <Routes>
        <Route path="/" element={<Navigate to="/ultims-contractes" replace />} />
        <Route path="/immobles" element={<Immobles config={config} />} />
        <Route path="/immobles/nou" element={<FitxaImmoble key="nou" config={config} />} />
        <Route path="/immobles/:id" element={<FitxaImmoble key="edicio" config={config} />} />
        <Route path="/immobles/:id/contractes" element={<Contractes config={config} />} />
        <Route
          path="/immobles/:id/contractes/nou"
          element={<FitxaContracte key="nou" config={config} />}
        />
        <Route path="/immobles/:id/documents" element={<DocumentsImmoble />} />
        <Route path="/ultims-contractes" element={<UltimsContractes config={config} />} />
        <Route path="/revisions" element={<Revisions config={config} />} />
        <Route
          path="/immobles/:id/contractes/:idContracte"
          element={<FitxaContracte key="edicio" config={config} />}
        />
        <Route
          path="/immobles/:id/contractes/:idContracte/documents"
          element={<DocumentsContracte />}
        />
        <Route
          path="/immobles/:id/contractes/:idContracte/revisions"
          element={<RevisionsContracte config={config} />}
        />
        <Route path="/inquilins" element={<Inquilins />} />
        <Route
          path="/configuracio"
          element={<Configuracio config={config} onCanviarConfig={onCanviarConfig} />}
        />
        <Route path="/quant-a" element={<QuantA />} />
      </Routes>
    </AppShell.Main>
  )
}

interface EstructuraProps {
  config: ConfigObtinguda
  onCanviarConfig: (canvis: Partial<Config>) => void
}

function Estructura({ config, onCanviarConfig }: EstructuraProps): React.JSX.Element {
  const { t } = useTranslation()

  if (config.posicioMenu === 'top') {
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

            <Box style={{ flex: 1 }} />

            <UnstyledButton onClick={() => window.api.app.sortir()}>
              <Group gap="xs">
                <IconLogout size={18} />
                <Text size="sm">{t('app.sortir')}</Text>
              </Group>
            </UnstyledButton>
          </Group>
        </AppShell.Header>
        <Rutas config={config} onCanviarConfig={onCanviarConfig} />
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
          <Box style={{ flex: 1 }} />
          <NavLink
            label={t('app.sortir')}
            leftSection={<IconLogout size={18} />}
            onClick={() => window.api.app.sortir()}
          />
        </AppShell.Navbar>
        <Rutas config={config} onCanviarConfig={onCanviarConfig} />
      </AppShell>
    )
  }
}

// HashRouter: l'app empaquetada es carrega des d'un fitxer (file://), on BrowserRouter no funciona.
function Lloguers(): React.JSX.Element {
  const [config, setConfig] = useState<ConfigObtinguda | null>(null)

  useEffect(() => {
    const carregarConfig = async (): Promise<void> => {
      const resultat = await window.api.config.obtenir()

      if (resultat.ok) {
        setConfig(resultat.dades)
      }
    }

    void carregarConfig()
  }, [])

  function canviarConfig(canvis: Partial<Config>): void {
    setConfig((actual) => (actual ? { ...actual, ...canvis } : actual))
  }

  return (
    <HashRouter>
      {config && <Estructura config={config} onCanviarConfig={canviarConfig} />}
    </HashRouter>
  )
}

export default Lloguers
