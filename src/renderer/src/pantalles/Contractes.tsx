import { useEffect, useState } from 'react'
import { Badge, Button, Group, Table, Text, Title, Stack, ActionIcon, Tooltip } from '@mantine/core'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adreca } from '../utils/adreca'
import { formatData } from '../utils/dates'
import { nomInquili } from '../utils/inquilins'
import { esOk } from '../utils/resultat'
import type { ContracteLlistat, Immoble } from '../../../shared/tipus'
import AccionsContracte from './AccionsContracte'
import AvisosContracte from '../components/AvisosContracte'
import { IconCornerUpLeft, IconPencil, IconPlus } from '@tabler/icons-react'
import { useEditarContracte } from '../utils/useEditarContracte'

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

  const editarContracte = useEditarContracte()

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

  const euros = new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })

  return (
    <>
      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}
      {!carregant && immoble === null && (
        <>
          <Text c="dimmed">{t('immobles.noTrobat')}</Text>
          <Button
            mt="md"
            variant="default"
            leftSection={<IconCornerUpLeft size={16} />}
            onClick={() => navigate('/immobles')}
          >
            {t('comu.tornar')}
          </Button>
        </>
      )}

      {immoble && (
        <>
          <Stack gap="sm" mb="md">
            <Title order={2}>{t('contractes.titolImmoble', { adreca: adreca(immoble) })}</Title>
            <Group justify="space-between">
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate(`/immobles/${immoble.id}/contractes/nou`)}
              >
                {t('comu.afegir')}
              </Button>
              <Button
                variant="default"
                leftSection={<IconCornerUpLeft size={16} />}
                onClick={() => navigate('/immobles')}
              >
                {t('comu.tornar')}
              </Button>
            </Group>
          </Stack>

          {contractes.length === 0 && <Text c="dimmed">{t('contractes.buit')}</Text>}

          {contractes.length > 0 && (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th />
                  <Table.Th>{t('contractes.camps.estat')}</Table.Th>
                  <Table.Th>{t('contractes.camps.dataInici')}</Table.Th>
                  <Table.Th>{t('contractes.camps.dataFi')}</Table.Th>
                  <Table.Th>{t('contractes.camps.dFiPrevista')}</Table.Th>
                  <Table.Th>{t('contractes.camps.inquilins')}</Table.Th>
                  <Table.Th>{t('contractes.camps.lloguerActual')}</Table.Th>
                  <Table.Th>{t('contractes.camps.avisos')}</Table.Th>
                  <Table.Th>{t('contractes.accions.titol')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {contractes.map((c) => (
                  <Table.Tr key={c.id}>
                    <Table.Td style={{ width: 1 }}>
                      <Tooltip label={t('comu.editar')}>
                        <ActionIcon
                          variant="subtle"
                          aria-label={t('comu.editar')}
                          onClick={() => editarContracte(c)}
                        >
                          <IconPencil size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
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
                      <AvisosContracte contracte={c} />
                    </Table.Td>
                    <Table.Td style={{ width: 1 }}>
                      <AccionsContracte contracte={c} onCanvi={() => setVersio((v) => v + 1)} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </>
      )}
    </>
  )
}

export default Contractes
