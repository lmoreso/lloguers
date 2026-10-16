import { useEffect, useState } from 'react'
import { ActionIcon, Badge, Button, Group, Table, Text, Title, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adreca } from '../utils/adreca'
import { formatData } from '../utils/dates'
import { esOk } from '../utils/resultat'
import type { ContracteLlistat, Immoble } from '../../../shared/tipus'
import { notifications } from '@mantine/notifications'
import { IconPencil, IconTrash } from '@tabler/icons-react'

// Contractes d'un immoble. S'hi entra només des d'Immobles (/immobles/:id/contractes).
function Contractes(): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [immoble, setImmoble] = useState<Immoble | null>(null)
  const [contractes, setContractes] = useState<ContracteLlistat[]>([])
  const [carregant, setCarregant] = useState(true)
  // Cada cop que canvia, l'efecte torna a llegir la llista de la BD.
  const [versio, setVersio] = useState(0)

  useEffect(() => {
    let cancelat = false
    Promise.all([
      window.api.inmobles.obtenirUn(Number(id)),
      window.api.contractes.obtenir(Number(id))
    ]).then(([rImmoble, rContractes]) => {
      if (cancelat) return
      if (esOk(rImmoble)) setImmoble(rImmoble.dades)
      if (esOk(rContractes)) setContractes(rContractes.dades)
      setCarregant(false)
    })
    // Si el component es desmunta abans que arribin les respostes, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [id, versio])

  const nomInquili = (nom: string | null, cognoms: string | null): string =>
    [nom, cognoms].filter(Boolean).join(' ') || t('inquilins.senseNom')

  const euros = new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })

  // Un contracte tancat (amb data de fi) demana confirmació abans d'editar-lo.
  function editar(c: ContracteLlistat): void {
    const anar = (): void => {
      navigate(`/immobles/${id}/contractes/${c.id}`)
    }
    if (c.data_fi === null) {
      anar()
      return
    }
    modals.openConfirmModal({
      title: t('contractes.editarTancat.titol'),
      children: <Text size="sm">{t('contractes.editarTancat.text')}</Text>,
      labels: { confirm: t('comu.editar'), cancel: t('comu.cancellar') },
      onConfirm: anar
    })
  }

  function demanarEliminar(c: ContracteLlistat): void {
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
        setVersio((v) => v + 1)
      }
    })
  }

  return (
    <>
      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}
      {!carregant && immoble === null && <Text c="dimmed">{t('immobles.noTrobat')}</Text>}

      {immoble && (
        <>
          <Group justify="space-between" mb="md">
            <Title order={2}>{t('contractes.titolImmoble', { adreca: adreca(immoble) })}</Title>
            <Button onClick={() => navigate(`/immobles/${immoble.id}/contractes/nou`)}>
              {t('comu.afegir')}
            </Button>
          </Group>

          {contractes.length === 0 && <Text c="dimmed">{t('contractes.buit')}</Text>}

          {contractes.length > 0 && (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('contractes.camps.estat')}</Table.Th>
                  <Table.Th>{t('contractes.camps.dataInici')}</Table.Th>
                  <Table.Th>{t('contractes.camps.dataFi')}</Table.Th>
                  <Table.Th>{t('contractes.camps.dFiPrevista')}</Table.Th>
                  <Table.Th>{t('contractes.camps.inquilins')}</Table.Th>
                  <Table.Th>{t('contractes.camps.lloguerActual')}</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {contractes.map((c) => (
                  <Table.Tr key={c.id}>
                    <Table.Td>
                      <Badge color={c.data_fi === null ? 'green' : 'gray'}>
                        {c.data_fi === null
                          ? t('contractes.estat.vigent')
                          : t('contractes.estat.tancat')}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{formatData(c.data_inici)}</Table.Td>
                    <Table.Td>{formatData(c.data_fi)}</Table.Td>
                    <Table.Td>{formatData(c.d_fi_prevista)}</Table.Td>
                    <Table.Td>
                      <Text size="sm">{nomInquili(c.inquili_nom, c.inquili_cognoms)}</Text>
                      {c.id_inquili_2 !== null && (
                        <Text size="sm" c="dimmed">
                          {nomInquili(c.inquili2_nom, c.inquili2_cognoms)}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>{euros.format(c.lloguer_actual)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <Tooltip label={t('comu.editar')}>
                          <ActionIcon
                            variant="subtle"
                            aria-label={t('comu.editar')}
                            onClick={() => editar(c)}
                          >
                            <IconPencil size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t('comu.eliminar')}>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            aria-label={t('comu.eliminar')}
                            onClick={() => demanarEliminar(c)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </>
      )}

      <Button mt="md" variant="default" onClick={() => navigate('/immobles')}>
        {t('comu.tornar')}
      </Button>
    </>
  )
}

export default Contractes
