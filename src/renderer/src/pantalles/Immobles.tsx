import { useEffect, useState } from 'react'
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Menu,
  Stack,
  Table,
  Text,
  Title,
  Tooltip
} from '@mantine/core'
import { estatCaducitat } from '../utils/caducitat'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { esOk } from '../utils/resultat'
import type { Immoble } from '../../../shared/tipus'
import { IconDots, IconFileText, IconPencil, IconTrash } from '@tabler/icons-react'
import { adreca } from '../utils/adreca'

const DOCUMENTS = [
  { clau: 'certificat', camp: 'cert_en_caduc' },
  { clau: 'cedula', camp: 'ced_hab_caduc' }
] as const

// Documents d'un immoble que estan caducats o a punt de caducar.
function alertes(i: Immoble): { clau: 'certificat' | 'cedula'; estat: 'caducat' | 'aviat' }[] {
  return DOCUMENTS.flatMap((d) => {
    const estat = estatCaducitat(i[d.camp])
    return estat ? [{ clau: d.clau, estat }] : []
  })
}

function Immobles(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [immobles, setImmobles] = useState<Immoble[]>([])
  const [carregant, setCarregant] = useState(true)
  // Cada cop que canvia, l'efecte torna a llegir la llista de la BD.
  const [versio, setVersio] = useState(0)
  const ambAvisos = immobles.filter((i) => alertes(i).length > 0).length

  useEffect(() => {
    let cancelat = false
    window.api.inmobles.obtenir().then((resposta) => {
      if (cancelat) return
      if (esOk(resposta)) setImmobles(resposta.dades)
      setCarregant(false)
    })
    // Si el component es desmunta abans que arribi la resposta, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [versio])

  function demanarEliminar(i: Immoble): void {
    modals.openConfirmModal({
      title: t('immobles.eliminar.titol'),
      children: <Text size="sm">{t('immobles.eliminar.confirmacio', { nom: adreca(i) })}</Text>,
      labels: { confirm: t('comu.eliminar'), cancel: t('comu.cancellar') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const resposta = await window.api.inmobles.eliminar(i.id)
        if (!esOk(resposta)) return
        notifications.show({ color: 'green', message: t('immobles.eliminat') })
        setVersio((v) => v + 1)
      }
    })
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>{t('menu.immobles')}</Title>
        <Button onClick={() => navigate('/immobles/nou')}>{t('comu.afegir')}</Button>
      </Group>

      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}
      {!carregant && immobles.length === 0 && <Text c="dimmed">{t('immobles.buit')}</Text>}
      {ambAvisos > 0 && (
        <Alert color="orange" mb="md">
          {t('immobles.caducitats.avis', { count: ambAvisos })}
        </Alert>
      )}

      {immobles.length > 0 && (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('immobles.camps.id')}</Table.Th>
              <Table.Th>{t('immobles.seccions.adreca')}</Table.Th>
              <Table.Th>{t('immobles.camps.localitat')}</Table.Th>
              <Table.Th>{t('immobles.camps.refCatastral')}</Table.Th>
              <Table.Th>{t('immobles.camps.superficie')}</Table.Th>
              <Table.Th>{t('immobles.camps.avisos')}</Table.Th>
              <Table.Th>{t('comu.accions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {immobles.map((i) => (
              <Table.Tr key={i.id}>
                <Table.Td>{i.id}</Table.Td>
                <Table.Td>{adreca(i)}</Table.Td>
                <Table.Td>{i.localitat}</Table.Td>
                <Table.Td>{i.ref_catastral}</Table.Td>
                <Table.Td>{i.superficie_m2}</Table.Td>
                <Table.Td>
                  <Stack gap={4} align="flex-start">
                    {alertes(i).map((a) => (
                      <Badge key={a.clau} color={a.estat === 'caducat' ? 'red' : 'orange'}>
                        {t(`immobles.caducitats.${a.clau}`)}: {t(`immobles.caducitats.${a.estat}`)}
                      </Badge>
                    ))}
                  </Stack>
                </Table.Td>
                <Table.Td style={{ width: 1 }}>
                  <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                      <Tooltip label={t('comu.accions')}>
                        <ActionIcon variant="subtle" aria-label={t('comu.accions')}>
                          <IconDots size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconFileText size={16} />}
                        onClick={() => navigate(`/immobles/${i.id}/contractes`)}
                      >
                        {t('contractes.titol')}
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconPencil size={16} />}
                        onClick={() => navigate(`/immobles/${i.id}`)}
                      >
                        {t('comu.editar')}
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={16} />}
                        onClick={() => demanarEliminar(i)}
                      >
                        {t('comu.eliminar')}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </>
  )
}

export default Immobles
