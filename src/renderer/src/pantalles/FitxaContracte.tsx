import { useEffect, useState } from 'react'
import { Button, Text, Title } from '@mantine/core'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adreca } from '../utils/adreca'
import { esOk } from '../utils/resultat'
import FormulariContracte from './FormulariContracte'
import type { Contracte, Immoble, Inquili } from '../../../shared/tipus'

// /immobles/:id/contractes/nou  i  /immobles/:id/contractes/:idContracte
function FitxaContracte(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id, idContracte } = useParams() // idContracte és undefined en un contracte nou
  const [immoble, setImmoble] = useState<Immoble | null>(null)
  const [inquilins, setInquilins] = useState<Inquili[]>([])
  const [contracte, setContracte] = useState<Contracte | null>(null)
  const [carregant, setCarregant] = useState(true)

  useEffect(() => {
    let cancelat = false
    const pContracte =
      idContracte === undefined
        ? Promise.resolve(null)
        : window.api.contractes.obtenirUn(Number(idContracte))
    Promise.all([
      window.api.inmobles.obtenirUn(Number(id)),
      window.api.inquilins.obtenir(),
      pContracte
    ]).then(([rImmoble, rInquilins, rContracte]) => {
      if (cancelat) return
      if (esOk(rImmoble)) setImmoble(rImmoble.dades)
      if (esOk(rInquilins)) setInquilins(rInquilins.dades)
      if (rContracte !== null && esOk(rContracte)) setContracte(rContracte.dades)
      setCarregant(false)
    })
    // Si el component es desmunta abans que arribin les respostes, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [id, idContracte])

  // Un contracte que no existeix, o que és d'un altre immoble, es tracta com a no trobat.
  const contracteNoTrobat =
    idContracte !== undefined && (contracte === null || contracte.id_inmoble !== Number(id))
  const noTrobat = !carregant && (immoble === null || contracteNoTrobat)

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
        <>
          <Title order={2}>
            {idContracte === undefined ? t('contractes.nou') : t('contractes.editar')}
          </Title>
          <Text c="dimmed" mb="md">
            {adreca(immoble)}
          </Text>
          <FormulariContracte immoble={immoble} contracte={contracte} inquilins={inquilins} />
        </>
      )}
    </>
  )
}

export default FitxaContracte
