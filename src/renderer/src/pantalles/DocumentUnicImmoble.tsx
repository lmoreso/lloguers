import { ActionIcon, Menu, Text, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  IconExternalLink,
  IconPaperclip,
  IconPencil,
  IconPlus,
  IconTrash
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { esOk } from '../utils/resultat'
import AfegirDocumentUnic from './AfegirDocumentUnic'
import EditarDocumentUnic from './EditarDocumentUnic'
import type { DocumentImmoble, TipusDocumentImmoble } from '../../../shared/tipus'

interface Props {
  idInmoble: number | null // null: l'immoble encara no s'ha desat
  tipus: TipusDocumentImmoble
  doc: DocumentImmoble | undefined // el document d'aquest tipus, si n'hi ha
  onCanvi: () => void // es crida quan s'afegeix, edita o elimina el document
}

// Icona amb menú per a un tipus de document que admet un sol document per immoble: sense document, Afegir;
// amb document, Visualitzar, Editar i Eliminar. Els documents es desen a l'instant, sense passar per Desar.
function DocumentUnicImmoble({ idInmoble, tipus, doc, onCanvi }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const nomTipus = t(`documentsImmoble.tipus.${tipus}`)
  // La fitxa cadastral és l'únic tipus que no té cap data a l'immoble.
  const ambData = tipus === 'fitxa_cadastral'

  function afegir(): void {
    if (idInmoble === null) return
    modals.open({
      title: t('documentsImmoble.unic.afegirTitol', { tipus: nomTipus }),
      children: (
        <AfegirDocumentUnic
          idInmoble={idInmoble}
          tipus={tipus}
          ambData={ambData}
          onAfegit={onCanvi}
        />
      )
    })
  }

  function editar(d: DocumentImmoble): void {
    modals.open({
      title: t('documentsImmoble.unic.editarTitol', { tipus: nomTipus }),
      children: <EditarDocumentUnic doc={d} ambData={ambData} onDesat={onCanvi} />
    })
  }

  // S'obre amb l'aplicació del sistema. Si el fitxer ja no és al disc, esOk mostra l'error traduït.
  async function visualitzar(d: DocumentImmoble): Promise<void> {
    esOk(await window.api.documentsImmoble.obrir(d.id))
  }

  function demanarEliminar(d: DocumentImmoble): void {
    modals.openConfirmModal({
      title: t('documentsImmoble.eliminar.titol'),
      children: (
        <Text size="sm">{t('documentsImmoble.eliminar.confirmacio', { nom: d.nom_original })}</Text>
      ),
      labels: { confirm: t('comu.eliminar'), cancel: t('comu.cancellar') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const resposta = await window.api.documentsImmoble.eliminar(d.id)
        if (!esOk(resposta)) return
        notifications.show({ color: 'green', message: t('documentsImmoble.eliminat') })
        onCanvi()
      }
    })
  }

  return (
    <Menu position="bottom-start" withinPortal disabled={idInmoble === null}>
      <Menu.Target>
        <Tooltip label={doc ? t('documentsImmoble.unic.amb') : t('documentsImmoble.unic.sense')}>
          <ActionIcon
            variant={doc ? 'light' : 'subtle'}
            color={doc ? 'blue' : 'gray'}
            size="sm"
            disabled={idInmoble === null}
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
            <Menu.Item
              leftSection={<IconExternalLink size={16} />}
              onClick={() => visualitzar(doc)}
            >
              {t('documentsImmoble.visualitzar')}
            </Menu.Item>
            <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => editar(doc)}>
              {t('comu.editar')}
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

export default DocumentUnicImmoble
