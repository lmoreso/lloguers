import { useEffect, useState } from 'react'
import { Alert, Button, Group, Stack, Text, Title } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  IconFileText,
  IconPlus,
  IconTrash,
  IconFiles,
  IconCornerUpLeft,
  IconCheck
} from '@tabler/icons-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adreca } from '../utils/adreca'
import { alertes } from '../utils/avisosImmoble'
import { teAvisos } from '../utils/avisosContracte'
import { esOk } from '../utils/resultat'
import FormulariImmoble from './FormulariImmoble'
import type { AccionsCapcalera } from './FormulariImmoble'
import type { Immoble } from '../../../shared/tipus'

function FitxaImmoble(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams() // undefined a /immobles/nou
  const [immoble, setImmoble] = useState<Immoble | null>(null)
  const [carregant, setCarregant] = useState(id !== undefined)
  // Algun dels contractes que surten a "Últims contractes" d'aquest immoble té algun avís.
  const [contractesAmbAvisos, setContractesAmbAvisos] = useState(false)
  // Canvia després de desar: el formulari es torna a muntar amb les dades noves (i sense canvis pendents).
  const [versioForm, setVersioForm] = useState(0)
  // Pestanya activa del formulari. Viu aquí perquè es conservi quan el formulari es torna a muntar en desar.
  const [pestanya, setPestanya] = useState('adreca')

  useEffect(() => {
    if (id === undefined) return
    let cancelat = false
    Promise.all([window.api.inmobles.obtenirUn(Number(id)), window.api.contractes.ultims()]).then(
      ([rImmoble, rUltims]) => {
        if (cancelat) return
        if (esOk(rImmoble)) setImmoble(rImmoble.dades)
        if (esOk(rUltims)) {
          setContractesAmbAvisos(
            rUltims.dades.some((x) => x.immoble.id === Number(id) && x.contractes.some(teAvisos))
          )
        }
        setCarregant(false)
      }
    )
    // Si el component es desmunta abans que arribin les respostes, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [id])

  const noTrobat = id !== undefined && !carregant && immoble === null
  const titol = id !== undefined ? t('immobles.editar') : t('immobles.nou')

  function alDesar(desat: Immoble): void {
    if (id === undefined) {
      // Immoble nou: passa a ser l'edició d'aquest immoble.
      navigate(`/immobles/${desat.id}`, { replace: true })
      return
    }
    setImmoble(desat)
    setVersioForm((v) => v + 1)
  }

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
        navigate('/immobles')
      }
    })
  }

  // Capçalera: títol, subtítol, barra d'avisos i una sola fila de botons (accions a l'esquerra; Tornar i Desar
  // a la dreta). Es veu a totes les pestanyes. La dibuixa el formulari a dalt de tot, i ens dona
  // `anarAmbGuarda` per preguntar abans de sortir si hi ha canvis sense desar.
  function capcalera({ anarAmbGuarda, idFormulari, tornar }: AccionsCapcalera): React.ReactNode {
    const alertesImmoble = immoble ? alertes(immoble) : []
    return (
      <Stack gap="sm" mb="md">
        <div>
          <Title order={2}>{titol}</Title>
          {immoble && (
            <Text c="dimmed">
              {t('immobles.subtitol', { id: immoble.id, adreca: adreca(immoble) })}
            </Text>
          )}
        </div>

        {(alertesImmoble.length > 0 || contractesAmbAvisos) && (
          <Alert color="orange">
            <Stack gap={2}>
              {alertesImmoble.map((a) => (
                <Text key={a.clau} size="sm">
                  {t(`immobles.caducitats.${a.clau}`)}: {t(`immobles.caducitats.${a.estat}`)}
                </Text>
              ))}
              {contractesAmbAvisos && (
                <Text size="sm">{t('immobles.caducitats.contractesAmbAvisos')}</Text>
              )}
            </Stack>
          </Alert>
        )}

        <Group justify="space-between">
          <Group gap="xs">
            <Button type="submit" form={idFormulari} leftSection={<IconCheck size={16} />}>
              {t('comu.desar')}
            </Button>
            {immoble && (
              <>
                <Button
                  variant="default"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => anarAmbGuarda(() => navigate('/immobles/nou'))}
                >
                  {t('immobles.nouBoto')}
                </Button>
                <Button
                  variant="default"
                  leftSection={<IconFileText size={16} />}
                  onClick={() =>
                    anarAmbGuarda(() => navigate(`/immobles/${immoble.id}/contractes`))
                  }
                >
                  {t('contractes.titol')}
                </Button>
                <Button
                  variant="default"
                  leftSection={<IconFiles size={16} />}
                  onClick={() => anarAmbGuarda(() => navigate(`/immobles/${immoble.id}/documents`))}
                >
                  {t('documentsImmoble.boto')}
                </Button>
                <Button
                  variant="default"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => demanarEliminar(immoble)}
                >
                  {t('comu.eliminar')}
                </Button>
              </>
            )}
          </Group>
          <Group gap="xs">
            <Button variant="default" onClick={tornar} leftSection={<IconCornerUpLeft size={16} />}>
              {t('comu.tornar')}
            </Button>
          </Group>
        </Group>
      </Stack>
    )
  }

  return (
    <>
      {(carregant || noTrobat) && (
        <Title order={2} mb="md">
          {titol}
        </Title>
      )}

      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}

      {noTrobat && (
        <>
          <Text c="dimmed">{t('immobles.noTrobat')}</Text>
          <Button mt="md" variant="default" onClick={() => navigate('/immobles')}>
            {t('comu.tornar')}
          </Button>
        </>
      )}

      {/* El formulari es munta un cop carregat: així comença amb els valors de la BD. */}
      {!carregant && !noTrobat && (
        <FormulariImmoble
          key={versioForm}
          immoble={immoble}
          onDesat={alDesar}
          capcalera={capcalera}
          pestanya={pestanya}
          onPestanya={setPestanya}
        />
      )}
    </>
  )
}

export default FitxaImmoble
