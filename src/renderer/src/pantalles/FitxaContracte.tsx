import { useEffect, useState } from 'react'
import { Alert, Button, Group, Stack, Text, Title } from '@mantine/core'
import { IconCheck, IconCornerUpLeft, IconFiles } from '@tabler/icons-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adreca } from '../utils/adreca'
import { esOk } from '../utils/resultat'
import FormulariContracte from './FormulariContracte'
import type { AccionsCapcalera } from './FormulariContracte'
import type { Contracte, Immoble, Inquili, ContracteLlistat } from '../../../shared/tipus'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { formatData } from '../utils/dates'
import { nomInquili } from '../utils/inquilins'
import {
  avisos,
  devolucioPendent,
  documentsQueFalten,
  ingresPendent
} from '../utils/avisosContracte'

// /immobles/:id/contractes/nou  i  /immobles/:id/contractes/:idContracte
function FitxaContracte(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id, idContracte } = useParams() // idContracte és undefined en un contracte nou
  const [immoble, setImmoble] = useState<Immoble | null>(null)
  const [inquilins, setInquilins] = useState<Inquili[]>([])
  const [contracte, setContracte] = useState<Contracte | null>(null)
  const [carregant, setCarregant] = useState(true)
  // Canvia després de desar: el formulari es torna a muntar amb les dades noves (i sense canvis pendents).
  const [versioForm, setVersioForm] = useState(0)
  // Pestanya activa del formulari. Viu aquí perquè es conservi quan el formulari es torna a muntar en desar.
  const [pestanya, setPestanya] = useState('dades')
  // El mateix contracte tal com surt a la llista de l'immoble: porta els indicadors dels documents, que calen
  // per als avisos de dalt.
  const [llistat, setLlistat] = useState<ContracteLlistat | null>(null)
  // Canvia després de desar: es tornen a llegir les dades i els avisos.
  const [versioDades, setVersioDades] = useState(0)

  useEffect(() => {
    let cancelat = false
    const pContracte =
      idContracte === undefined
        ? Promise.resolve(null)
        : window.api.contractes.obtenirUn(Number(idContracte))
    const pLlistat =
      idContracte === undefined ? Promise.resolve(null) : window.api.contractes.obtenir(Number(id))
    Promise.all([
      window.api.inmobles.obtenirUn(Number(id)),
      window.api.inquilins.obtenir(),
      pContracte,
      pLlistat
    ]).then(([rImmoble, rInquilins, rContracte, rLlistat]) => {
      if (cancelat) return
      if (esOk(rImmoble)) setImmoble(rImmoble.dades)
      if (esOk(rInquilins)) setInquilins(rInquilins.dades)
      if (rContracte !== null && esOk(rContracte)) setContracte(rContracte.dades)
      if (rLlistat !== null && esOk(rLlistat)) {
        setLlistat(rLlistat.dades.find((c) => c.id === Number(idContracte)) ?? null)
      }
      setCarregant(false)
    })
    // Si el component es desmunta abans que arribin les respostes, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [id, idContracte, versioDades])

  // Un contracte que no existeix, o que és d'un altre immoble, es tracta com a no trobat.
  const contracteNoTrobat =
    idContracte !== undefined && (contracte === null || contracte.id_inmoble !== Number(id))
  const noTrobat = !carregant && (immoble === null || contracteNoTrobat)

  function alDesar(desat: Contracte): void {
    if (idContracte === undefined) {
      // Contracte nou: passa a ser l'edició d'aquest contracte.
      navigate(`/immobles/${desat.id_inmoble}/contractes/${desat.id}`, { replace: true })
      return
    }
    setContracte(desat)
    setVersioForm((v) => v + 1)
    setVersioDades((v) => v + 1)
  }

  function demanarEliminar(c: Contracte): void {
    const nom = (idInquili: number): string => {
      const i = inquilins.find((x) => x.id === idInquili)
      return nomInquili(i?.nom ?? null, i?.cognoms ?? null)
    }
    const noms = [
      nom(c.id_inquili),
      ...(c.id_inquili_2 !== null ? [nom(c.id_inquili_2)] : [])
    ].join(' / ')
    modals.openConfirmModal({
      title: t('contractes.eliminar.titol'),
      children: (
        <Text size="sm">
          {t('contractes.eliminar.confirmacio', {
            inquilins: noms,
            inici: formatData(c.data_inici)
          })}
        </Text>
      ),
      labels: { confirm: t('comu.eliminar'), cancel: t('comu.cancellar') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const resposta = await window.api.contractes.eliminar(c.id)
        if (!esOk(resposta)) return
        notifications.show({ color: 'green', message: t('contractes.eliminat') })
        navigate(`/immobles/${c.id_inmoble}/contractes`)
      }
    })
  }

  // Capçalera: títol, subtítol i una sola fila de botons (Desar i Documents a l'esquerra; Tornar a la dreta). La
  // dibuixa el formulari a dalt de tot, i ens dona `anarAmbGuarda` per preguntar abans de sortir si hi ha
  // canvis sense desar.
  function capcalera({ anarAmbGuarda, desar, tornar }: AccionsCapcalera): React.ReactNode {
    return (
      <Stack gap="sm" mb="md">
        <div>
          <Title order={2}>
            {idContracte === undefined ? t('contractes.nou') : t('contractes.editar')}
          </Title>
          {immoble && <Text c="dimmed">{adreca(immoble)}</Text>}
        </div>

        {llistat &&
          (() => {
            const linies: string[] = [
              ...avisos(llistat).map((a) => t(`contractes.avisos.${a.clau}.${a.estat}`)),
              ...(ingresPendent(llistat) ? [t('contractes.avisIngres')] : []),
              ...documentsQueFalten(llistat).map((d) => t(`documents.avis.${d}`)),
              ...(devolucioPendent(llistat) ? [t('contractes.avisos.devolucioPendent')] : [])
            ]
            return linies.length > 0 ? (
              <Alert color="orange">
                <Stack gap={2}>
                  {linies.map((l) => (
                    <Text key={l} size="sm">
                      {l}
                    </Text>
                  ))}
                </Stack>
              </Alert>
            ) : null
          })()}

        <Group justify="space-between">
          <Group gap="xs">
            <Button leftSection={<IconCheck size={16} />} onClick={desar}>
              {t('comu.desar')}
            </Button>
            {contracte && (
              <>
                <Button
                  variant="default"
                  leftSection={<IconFiles size={16} />}
                  onClick={() =>
                    anarAmbGuarda(() =>
                      navigate(
                        `/immobles/${contracte.id_inmoble}/contractes/${contracte.id}/documents`
                      )
                    )
                  }
                >
                  {t('contractes.accions.documents')}
                </Button>
                <Button
                  variant="default"
                  leftSection={<IconPlus size={16} />}
                  onClick={() =>
                    anarAmbGuarda(() =>
                      navigate(`/immobles/${contracte.id_inmoble}/contractes/nou`)
                    )
                  }
                >
                  {t('comu.afegir')}
                </Button>
                <Button
                  variant="default"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => demanarEliminar(contracte)}
                >
                  {t('comu.eliminar')}
                </Button>
              </>
            )}
          </Group>
          <Button variant="default" leftSection={<IconCornerUpLeft size={16} />} onClick={tornar}>
            {t('comu.tornar')}
          </Button>
        </Group>
      </Stack>
    )
  }

  return (
    <>
      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}

      {noTrobat && (
        <>
          <Text c="dimmed">
            {immoble === null ? t('immobles.noTrobat') : t('contractes.noTrobat')}
          </Text>
          <Button
            mt="md"
            variant="default"
            onClick={() => navigate(immoble === null ? '/immobles' : `/immobles/${id}/contractes`)}
          >
            {t('comu.tornar')}
          </Button>
        </>
      )}

      {/* El formulari es munta un cop carregat: així comença amb els valors de la BD. */}
      {!carregant && !noTrobat && immoble && (
        <FormulariContracte
          key={versioForm}
          immoble={immoble}
          contracte={contracte}
          inquilins={inquilins}
          onDesat={alDesar}
          capcalera={capcalera}
          pestanya={pestanya}
          onPestanya={setPestanya}
        />
      )}
    </>
  )
}

export default FitxaContracte
