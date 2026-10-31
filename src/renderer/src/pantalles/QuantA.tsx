import { useEffect, useState } from 'react'
import { Anchor, Badge, Fieldset, Group, Image, Stack, Text, Title, Tooltip } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import icona from '../assets/icon.png'
import { esOk } from '../utils/resultat'
import { IconBrandGithub } from '@tabler/icons-react'

// Noms propis i adreces: no es tradueixen.
const AUTOR = 'Lluís Moreso Bosch'
const URL_AUTOR = 'https://www.linkedin.com/in/consultornominameta4bcn/'
const URL_CLAUDE = 'https://claude.ai'
const TECNOLOGIES = [
  {
    nom: 'Node.js',
    url: 'https://nodejs.org',
    label: "Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine"
  },
  {
    nom: 'Electron',
    url: 'https://www.electronjs.org',
    label: 'Build cross-platform desktop apps with JavaScript, HTML, and CSS'
  },
  {
    nom: 'React',
    url: 'https://react.dev',
    label: 'The library for web and native user interfaces'
  },
  {
    nom: 'TypeScript',
    url: 'https://www.typescriptlang.org',
    label: 'TypeScript is JavaScript with syntax for types'
  },
  { nom: 'Vite', url: 'https://vite.dev', label: 'The Build Tool for the Web' },
  {
    nom: 'Mantine',
    url: 'https://mantine.dev',
    label: 'A fully featured React components library and hooks for building web applications'
  },
  {
    nom: 'SQLite',
    url: 'https://www.sqlite.org',
    label:
      'SQLite is a C-language library that implements a small, fast, self-contained, high-reliability, full-featured, SQL database engine'
  },
  {
    nom: 'better-sqlite3',
    url: 'https://github.com/WiseLibs/better-sqlite3',
    label: 'A simple and fast SQLite3 driver for Node.js'
  },
  {
    nom: 'i18next',
    url: 'https://www.i18next.com',
    label: 'i18next is a powerful internationalization framework for web applications'
  }
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

      <Fieldset
        legend={t('quantA.caracteristiques')}
        fw={700}
        styles={{
          legend: {
            fontSize: '14px',
            fontWeight: 700
          }
        }}
      >
        <Text fz="sm">{t('quantA.descripcio2')}</Text>
        <Text fz="sm">{t('quantA.descripcio3')}</Text>
        <Text fz="sm">{t('quantA.descripcio4')}</Text>
        <Text fz="sm">{t('quantA.descripcio5')}</Text>
        <Text fz="sm">{t('quantA.descripcio6')}</Text>
      </Fieldset>

      <div>
        <Text fw={700}>{t('quantA.autor')}</Text>
        <Text>
          {'© 2026 - '}
          <Tooltip label={URL_AUTOR}>
            <Anchor component="button" type="button" onClick={() => obrir(URL_AUTOR)}>
              {AUTOR}
            </Anchor>
          </Tooltip>
        </Text>
      </div>

      <Fieldset
        legend={t('quantA.tecnologies')}
        fw={700}
        styles={{
          legend: {
            fontSize: '14px',
            fontWeight: 700
          }
        }}
      >
        <div>
          <Group gap="xs">
            {TECNOLOGIES.map((x) => (
              <Tooltip key={x.nom} label={x.label + ' (' + x.url + ')'} w={300} multiline>
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
              </Tooltip>
            ))}
          </Group>
        </div>

        <Text mt={20} fz="sm">
          {t('quantA.claudeAbans')}{' '}
          <Tooltip label={URL_CLAUDE}>
            <Anchor component="button" type="button" onClick={() => obrir(URL_CLAUDE)}>
              <Text span fz="sm">
                Claude
              </Text>
            </Anchor>
          </Tooltip>
          {t('quantA.claudeDespres')}
        </Text>

        <div>
          <Text fw={700} mt={15} fz="sm">
            {t('quantA.llicenciaTitol')}
          </Text>
          <Text mt={4}>
            <Text span fz="sm">
              {t('quantA.llicenciaAbans')}
            </Text>
            <Tooltip label="https://choosealicense.com/es/licenses/mit/">
              <Anchor
                component="button"
                type="button"
                onClick={() => obrir('https://choosealicense.com/es/licenses/mit/')}
              >
                <Text fz="sm">{t('quantA.llicencia')}</Text>
              </Anchor>
            </Tooltip>
            {'.'}
          </Text>
        </div>

        <div>
          <Text fw={700} mt={15} fz="sm">
            {t('quantA.gitHubTitol')}
          </Text>
          <Text mt={4} fz="sm">
            {t('quantA.gitHubAbans')}{' '}
            <Tooltip label="https://github.com/lmoreso/lloguers">
              <Anchor
                component="button"
                type="button"
                onClick={() => obrir('https://github.com/lmoreso/lloguers')}
              >
                <IconBrandGithub size={14} />
                <Text span fz="sm">
                  {' GitHub'}
                </Text>
              </Anchor>
            </Tooltip>
            {'.'}
          </Text>
        </div>
      </Fieldset>

      <Fieldset
        legend={t('quantA.disclaimerTitol')}
        fw={700}
        styles={{
          legend: {
            fontSize: '14px',
            fontWeight: 700
          }
        }}
      >
        <Text fz="sm">{t('quantA.disclaimer')}</Text>
        <Text fz="sm">{t('quantA.disclaimer2')}</Text>
      </Fieldset>
    </Stack>
  )
}

export default QuantA
