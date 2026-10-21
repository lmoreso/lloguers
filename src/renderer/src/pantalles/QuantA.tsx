import { useEffect, useState } from 'react'
import { Anchor, Badge, Group, Image, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import icona from '../assets/icon.png'
import { esOk } from '../utils/resultat'
import { IconBrandGithub } from '@tabler/icons-react'

// Noms propis i adreces: no es tradueixen.
const AUTOR = 'Lluís Moreso Bosch'
const URL_CLAUDE = 'https://claude.ai'
const TECNOLOGIES = [
  { nom: 'Electron', url: 'https://www.electronjs.org' },
  { nom: 'React', url: 'https://react.dev' },
  { nom: 'TypeScript', url: 'https://www.typescriptlang.org' },
  { nom: 'Vite', url: 'https://vite.dev' },
  { nom: 'Mantine', url: 'https://mantine.dev' },
  { nom: 'SQLite', url: 'https://www.sqlite.org' },
  { nom: 'better-sqlite3', url: 'https://github.com/WiseLibs/better-sqlite3' },
  { nom: 'i18next', url: 'https://www.i18next.com' },
  { nom: 'GitHub', url: 'https://github.com/lmoreso/lloguers' }
]

function QuantA(): React.JSX.Element {
  const { t } = useTranslation()
  const [versio, setVersio] = useState<string | null>(null)

  useEffect(() => {
    let cancelat = false
    window.api.app.versio().then((resposta) => {
      if (cancelat) return
      if (esOk(resposta)) setVersio(resposta.dades)
    })
    // Si el component es desmunta abans que arribi la resposta, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [])

  // S'obre al navegador del sistema, via Main (que només accepta adreces https).
  // Si falla, esOk mostra l'error traduït.
  async function obrir(url: string): Promise<void> {
    esOk(await window.api.app.obrirEnllac(url))
  }

  return (
    <Stack gap="md" maw={640}>
      <Group gap="sm">
        <Image src={icona} w={40} h={40} alt="" />
        <Title order={2}>{t('quantA.titol')}</Title>
      </Group>

      <div>
        <Text fw={700} size="lg">
          Lloguers
        </Text>
        {versio && (
          <Text c="dimmed">
            {t('quantA.versio')} {versio}
          </Text>
        )}
      </div>

      <Text>{t('quantA.descripcio')}</Text>

      <div>
        <Text fw={700}>{t('quantA.autor')}</Text>
        <Text>
          {'© 2026 - '}
          {AUTOR}
        </Text>
      </div>

      <div>
        <Text fw={700} mb={4}>
          {t('quantA.tecnologies')}
        </Text>
        <Group gap="xs">
          {TECNOLOGIES.map((x) => (
            <Badge
              key={x.nom}
              component="button"
              type="button"
              variant="light"
              color="gray"
              style={{ cursor: 'pointer' }}
              onClick={() => obrir(x.url)}
            >
              {x.nom}
            </Badge>
          ))}
        </Group>
      </div>

      <Text>
        {t('quantA.claudeAbans')}{' '}
        <Anchor component="button" type="button" onClick={() => obrir(URL_CLAUDE)}>
          Claude
        </Anchor>
        {t('quantA.claudeDespres')}
      </Text>

      <div>
        <Text fw={700}>{t('quantA.llicenciaTitol')}</Text>
        <Text>
          {t('quantA.llicenciaAbans')}
          <Anchor
            component="button"
            type="button"
            onClick={() => obrir('https://choosealicense.com/es/licenses/mit/')}
          >
            {t('quantA.llicencia')}
          </Anchor>
          {'.'}
        </Text>
      </div>

      <div>
        <Text fw={700}>{t('quantA.gitHubTitol')}</Text>
        <Text>
          {t('quantA.gitHubAbans')}{' '}
          <Anchor
            component="button"
            type="button"
            onClick={() => obrir('https://github.com/lmoreso/lloguers')}
          >
            <IconBrandGithub size={16} /> {'GitHub'}
          </Anchor>
          {'.'}
        </Text>
      </div>
    </Stack>
  )
}

export default QuantA
