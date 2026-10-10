import { useEffect, useState } from 'react'
import { Button, Group, Modal, Table, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { esOk } from '../utils/resultat'
import FormulariInquili from './FormulariInquili'
import type { Inquili } from '../../../shared/tipus'

function Inquilins(): React.JSX.Element {
  const { t } = useTranslation()
  const [inquilins, setInquilins] = useState<Inquili[]>([])
  const [carregant, setCarregant] = useState(true)
  // Cada cop que canvia, l'efecte torna a llegir la llista de la BD.
  const [versio, setVersio] = useState(0)
  // null = modal tancat; { inquili: null } = nou inquilí.
  const [modal, setModal] = useState<{ inquili: Inquili | null } | null>(null)

  useEffect(() => {
    let cancelat = false
    window.api.inquilins.obtenir().then((resposta) => {
      if (cancelat) return
      if (esOk(resposta)) setInquilins(resposta.dades)
      setCarregant(false)
    })
    // Si el component es desmunta abans que arribi la resposta, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [versio])

  const siNo = (valor: boolean): string => (valor ? t('comu.si') : t('comu.no'))

  function alDesar(): void {
    setModal(null)
    setVersio((v) => v + 1)
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>{t('menu.inquilins')}</Title>
        <Button onClick={() => setModal({ inquili: null })}>{t('comu.afegir')}</Button>
      </Group>

      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}
      {!carregant && inquilins.length === 0 && <Text c="dimmed">{t('inquilins.buit')}</Text>}

      {inquilins.length > 0 && (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('inquilins.camps.nom')}</Table.Th>
              <Table.Th>{t('inquilins.camps.cognoms')}</Table.Th>
              <Table.Th>{t('inquilins.camps.nif')}</Table.Th>
              <Table.Th>{t('inquilins.camps.telefon')}</Table.Th>
              <Table.Th>{t('inquilins.camps.wassap')}</Table.Th>
              <Table.Th>{t('inquilins.camps.bizum')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {inquilins.map((i) => (
              <Table.Tr key={i.id}>
                <Table.Td>{i.nom ?? t('inquilins.senseNom')}</Table.Td>
                <Table.Td>{i.cognoms}</Table.Td>
                <Table.Td>{i.nif}</Table.Td>
                <Table.Td>{i.telefon_1}</Table.Td>
                <Table.Td>{siNo(i.ck_tel1_wassap)}</Table.Td>
                <Table.Td>{siNo(i.ck_tel1_bizum)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal
        opened={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.inquili ? t('inquilins.editar') : t('inquilins.nou')}
      >
        {/* Només es munta mentre és obert: així el formulari sempre comença net. */}
        {modal && (
          <FormulariInquili
            inquili={modal.inquili}
            onTancar={() => setModal(null)}
            onDesat={alDesar}
          />
        )}
      </Modal>
    </>
  )
}

export default Inquilins
