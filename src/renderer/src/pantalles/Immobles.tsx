import { useEffect, useState } from 'react'
import { Button, Group, Table, Text, Title } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { esOk } from '../utils/resultat'
import type { Immoble } from '../../../shared/tipus'

// "Carrer Major 12, 3r 2a": la porta és opcional.
function adreca(i: Immoble): string {
  return `${i.via} ${i.num_via}, ${i.pis}${i.porta ? ` ${i.porta}` : ''}`
}

function Immobles(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [immobles, setImmobles] = useState<Immoble[]>([])
  const [carregant, setCarregant] = useState(true)
  // Cada cop que canvia, l'efecte torna a llegir la llista de la BD.
  const [versio, setVersio] = useState(0)

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

      {immobles.length > 0 && (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('immobles.seccions.adreca')}</Table.Th>
              <Table.Th>{t('immobles.camps.localitat')}</Table.Th>
              <Table.Th>{t('immobles.camps.refCatastral')}</Table.Th>
              <Table.Th>{t('immobles.camps.superficie')}</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {immobles.map((i) => (
              <Table.Tr key={i.id}>
                <Table.Td>{adreca(i)}</Table.Td>
                <Table.Td>{i.localitat}</Table.Td>
                <Table.Td>{i.ref_catastral}</Table.Td>
                <Table.Td>{i.superficie_m2}</Table.Td>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() => navigate(`/immobles/${i.id}`)}
                    >
                      {t('comu.editar')}
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => demanarEliminar(i)}
                    >
                      {t('comu.eliminar')}
                    </Button>
                  </Group>
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
