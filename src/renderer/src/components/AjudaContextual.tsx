import { useEffect, useState } from 'react'
import { ActionIcon, Modal, Paper, ScrollArea, Text } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import ReactMarkdown from 'react-markdown'
import { useTranslation } from 'react-i18next'
import { Idioma } from '../../../shared/tipus'

interface Props {
  fitxer: string
  idioma: Idioma
  iconSize: number
}

type EstatCarrega =
  { estat: 'carregant' } | { estat: 'error' } | { estat: 'carregat'; contingut: string }

const fitxersAjuda = import.meta.glob<string>('../ajudes/**/*.md', {
  query: '?raw',
  import: 'default'
})

function AjudaContextual({ fitxer, idioma, iconSize }: Props): React.JSX.Element {
  const { t } = useTranslation()

  const [obert, setObert] = useState(false)
  const [resultat, setResultat] = useState<EstatCarrega>({
    estat: 'carregant'
  })

  useEffect((): (() => void) => {
    let actiu = true

    const ruta = `../ajudes/${idioma}/${fitxer}.md`
    const carregar = fitxersAjuda[ruta]

    Promise.resolve()
      .then((): Promise<string> => {
        if (!carregar) {
          return Promise.reject(new Error('Fitxer no trobat'))
        }

        return carregar()
      })
      .then((contingut: string): void => {
        if (actiu) {
          setResultat({ estat: 'carregat', contingut })
        }
      })
      .catch((): void => {
        if (actiu) {
          setResultat({ estat: 'error' })
        }
      })

    return (): void => {
      actiu = false
    }
  }, [fitxer, idioma])

  return (
    <>
      <ActionIcon
        variant="subtle"
        color="blue"
        //aria-label={t('ajuda.obrir')}
        onClick={() => setObert(true)}
        size="lg"
      >
        <IconInfoCircle size={iconSize} />
      </ActionIcon>

      <Modal
        opened={obert}
        onClose={() => setObert(false)}
        title={t('ajuda.titol')}
        centered
        size="lg"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {resultat.estat === 'carregant' && <Text size="sm">{t('ajuda.carregant')}</Text>}

        {resultat.estat === 'error' && (
          <Text size="sm" c="red">
            {t('ajuda.error')}
          </Text>
        )}

        {resultat.estat === 'carregat' && (
          <Paper p="md" className="markdown">
            <ReactMarkdown>{resultat.contingut}</ReactMarkdown>
          </Paper>
        )}
      </Modal>
    </>
  )
}

export default AjudaContextual
