import { useEffect, useState } from 'react'
import { Anchor, Badge, Button, Table, Text, Title } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AvisosContracte from '../components/AvisosContracte'
import { adreca } from '../utils/adreca'
import { formatData } from '../utils/dates'
import { nomInquili } from '../utils/inquilins'
import { esOk } from '../utils/resultat'
import AccionsContracte from './AccionsContracte'
import type { ContracteLlistat, Immoble, ImmobleAmbContractes } from '../../../shared/tipus'

// Una fila de la taula: un contracte, o un immoble sense cap contracte.
interface Fila {
  immoble: Immoble
  contracte: ContracteLlistat | null
}

// Vista "Últims contractes": per a cada immoble, els contractes en curs (vigents o tancats a futur) i,
// si ja han acabat tots, l'últim. Els immobles sense contracte també hi són.
function UltimsContractes(): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [dades, setDades] = useState<ImmobleAmbContractes[]>([])
  const [carregant, setCarregant] = useState(true)
  // Cada cop que canvia, l'efecte torna a llegir la llista de la BD.
  const [versio, setVersio] = useState(0)

  useEffect(() => {
    let cancelat = false
    window.api.contractes.ultims().then((resposta) => {
      if (cancelat) return
      if (esOk(resposta)) setDades(resposta.dades)
      setCarregant(false)
    })
    // Si el component es desmunta abans que arribi la resposta, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [versio])

  const euros = new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })

  // const files: Fila[] = dades.flatMap((d) =>
  const files = dades.flatMap<Fila>((d) =>
    d.contractes.length > 0
      ? d.contractes.map((c) => ({ immoble: d.immoble, contracte: c }))
      : [{ immoble: d.immoble, contracte: null }]
  )

  return (
    <>
      <Title order={2} mb="md">
        {t('contractes.ultims.titol')}
      </Title>

      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}
      {!carregant && files.length === 0 && <Text c="dimmed">{t('immobles.buit')}</Text>}

      {files.length > 0 && (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('immobles.seccions.adreca')}</Table.Th>
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
            {files.map(({ immoble, contracte: c }) => (
              <Table.Tr key={c ? `c${c.id}` : `i${immoble.id}`}>
                <Table.Td>
                  <Anchor
                    component="button"
                    type="button"
                    onClick={() => navigate(`/immobles/${immoble.id}/contractes`)}
                  >
                    {adreca(immoble)}
                  </Anchor>
                </Table.Td>
                {c === null ? (
                  <>
                    <Table.Td colSpan={7}>
                      <Badge variant="light" color="gray">
                        {t('contractes.ultims.senseContracte')}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ width: 1 }}>
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={() => navigate(`/immobles/${immoble.id}/contractes/nou`)}
                      >
                        {t('comu.afegir')}
                      </Button>
                    </Table.Td>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </>
  )
}

export default UltimsContractes
