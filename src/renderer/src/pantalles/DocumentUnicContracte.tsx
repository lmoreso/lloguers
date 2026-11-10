import { useState } from 'react'
import { ActionIcon, Menu, Text, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  // IconExternalLink,
  IconEye,
  IconPaperclip,
  IconPlus,
  IconTrash
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { esOk } from '../utils/resultat'
import type { DocumentContracte, TipusDocumentContracte } from '../../../shared/tipus'

interface Props {
  idContracte: number | null // null: el contracte encara no s'ha desat
  tipus: TipusDocumentContracte
  doc: DocumentContracte | undefined // el document d'aquest tipus, si n'hi ha
  onCanvi: () => void // es crida quan s'afegeix o s'elimina el document
}

// Icona amb menú per a un tipus de document que admet un sol document per contracte: sense document, Afegir (obre
// directament el diàleg del sistema, un sol fitxer, sense comentari); amb document, Visualitzar i Eliminar. Els
// documents es desen a l'instant, sense passar per Desar.
function DocumentUnicContracte({ idContracte, tipus, doc, onCanvi }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [adjuntant, setAdjuntant] = useState(false)
  const nomTipus = t(`documents.tipus.${tipus}`)

  async function afegir(): Promise<void> {
    if (idContracte === null) return
    setAdjuntant(true)
    const resposta = await window.api.documents.adjuntar(
      idContracte,
      { tipus, comentaris: null, data_document: null },
      t('documents.unic.dialeg')
    )
    setAdjuntant(false)
    // Una llista buida vol dir que l'usuari ha cancel·lat el diàleg: no cal notificar res.
    if (!esOk(resposta) || resposta.dades.length === 0) return
    notifications.show({ color: 'green', message: t('documents.adjuntats', { count: 1 }) })
    onCanvi()
  }

  // S'obre amb l'aplicació del sistema. Si el fitxer ja no és al disc, esOk mostra l'error traduït.
  async function visualitzar(d: DocumentContracte): Promise<void> {
    esOk(await window.api.documents.obrir(d.id))
  }

  function demanarEliminar(d: DocumentContracte): void {
    modals.openConfirmModal({
      title: t('documents.eliminar.titol'),
      children: (
        <Text size="sm">{t('documents.eliminar.confirmacio', { nom: d.nom_original })}</Text>
      ),
      labels: { confirm: t('comu.eliminar'), cancel: t('comu.cancellar') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const resposta = await window.api.documents.eliminar(d.id)
        if (!esOk(resposta)) return
        notifications.show({ color: 'green', message: t('documents.eliminat') })
        onCanvi()
      }
    })
  }

  return (
    <Menu position="bottom-start" withinPortal disabled={idContracte === null}>
      <Menu.Target>
        <Tooltip label={doc ? t('documents.unic.amb') : t('documents.unic.sense')}>
          <ActionIcon
            variant={doc ? 'light' : 'subtle'}
            color={doc ? 'blue' : 'gray'}
            size="sm"
            loading={adjuntant}
            disabled={idContracte === null}
            aria-label={nomTipus}
          >
            <IconPaperclip size={16} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        {doc ? (
          <>
            <Menu.Label>{doc.nom_original}</Menu.Label>
            <Menu.Item leftSection={<IconEye size={16} />} onClick={() => visualitzar(doc)}>
              {t('documents.visualitzar')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() => demanarEliminar(doc)}
            >
              {t('comu.eliminar')}
            </Menu.Item>
          </>
        ) : (
          <Menu.Item leftSection={<IconPlus size={16} />} onClick={afegir}>
            {t('comu.afegir')}
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}

export default DocumentUnicContracte
