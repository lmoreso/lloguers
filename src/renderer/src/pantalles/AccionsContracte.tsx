import { ActionIcon, Menu, Text, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  IconCurrencyEuro,
  IconDots,
  IconFiles,
  IconPencil,
  IconPlus,
  IconTrash
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatData } from '../../../shared/utilitats'
import { nomInquili } from '../utils/inquilins'
import { esOk } from '../utils/resultat'
import type { ContracteLlistat, Immoble } from '../../../shared/tipus'
import { useEditarContracte } from '../utils/useEditarContracte'

interface Props {
  contracte: ContracteLlistat
  // Es crida quan una acció ha canviat dades (eliminar): la pantalla que mostra el contracte ha de tornar a llegir la llista.
  onCanvi: () => void
}

// Menú d'accions d'un contracte (una sola icona per fila): Documents, Editar i Eliminar. Tancar el contracte, la
// devolució de la fiança i la revisió del lloguer es fan des del formulari.
export function AccionsContracte({ contracte: c, onCanvi }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()

  function documents(): void {
    navigate(`/immobles/${c.id_inmoble}/contractes/${c.id}/documents`)
  }

  function revisions(): void {
    navigate(`/immobles/${c.id_inmoble}/contractes/${c.id}/revisions`)
  }

  function immobles(): void {
    navigate(`/immobles/${c.id_inmoble}`)
  }

  function contracteNou(): void {
    navigate(`/immobles/${c.id_inmoble}/contractes/nou`)
  }

  // Un contracte tancat (amb data de fi) demana confirmació abans d'editar-lo.
  const editarContracte = useEditarContracte()

  function demanarEliminar(): void {
    const inquilins = [
      nomInquili(c.inquili_nom, c.inquili_cognoms),
      ...(c.id_inquili_2 !== null ? [nomInquili(c.inquili2_nom, c.inquili2_cognoms)] : [])
    ].join(' / ')
    modals.openConfirmModal({
      title: t('contractes.eliminar.titol'),
      children: (
        <Text size="sm">
          {t('contractes.eliminar.confirmacio', { inquilins, inici: formatData(c.data_inici) })}
        </Text>
      ),
      labels: { confirm: t('comu.eliminar'), cancel: t('comu.cancellar') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const resposta = await window.api.contractes.eliminar(c.id)
        if (!esOk(resposta)) return
        notifications.show({ color: 'green', message: t('contractes.eliminat') })
        onCanvi()
      }
    })
  }

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Tooltip label={t('contractes.accions.titol')}>
          <ActionIcon variant="subtle" aria-label={t('contractes.accions.titol')}>
            <IconDots size={18} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => editarContracte(c)}>
          {t('contractes.editar')}
        </Menu.Item>
        <Menu.Item leftSection={<IconCurrencyEuro size={16} />} onClick={revisions}>
          {t('contractes.accions.revisarLloguer')}
        </Menu.Item>
        <Menu.Item leftSection={<IconFiles size={16} />} onClick={documents}>
          {t('contractes.accions.documents')}
        </Menu.Item>
        <Menu.Item leftSection={<IconPlus size={16} />} onClick={contracteNou}>
          {t('immobles.afegirContracte')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<IconPencil size={16} />} onClick={immobles}>
          {t('immobles.editar')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={demanarEliminar}>
          {t('comu.eliminar')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

interface SenseProps {
  immoble: Immoble
}
/**
 * Menú d'accions d'un Immoble sense contracte (una sola icona per fila):  Crear contracte i Editar Immoble.
 */
export function AccionsSenseContracte({ immoble: i }: SenseProps): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()

  function immobles(): void {
    navigate(`/immobles/${i.id}`)
  }

  function contracteNou(): void {
    navigate(`/immobles/${i.id}/contractes/nou`)
  }

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Tooltip label={t('contractes.accions.titol')}>
          <ActionIcon variant="subtle" aria-label={t('contractes.accions.titol')}>
            <IconDots size={18} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconPlus size={16} />} onClick={contracteNou}>
          {t('immobles.afegirContracte')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<IconPencil size={16} />} onClick={immobles}>
          {t('immobles.editar')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
