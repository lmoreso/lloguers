import { useEffect, useState } from 'react'
import { Button, Text, Title } from '@mantine/core'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { esOk } from '../utils/resultat'
import FormulariImmoble from './FormulariImmoble'
import type { Immoble } from '../../../shared/tipus'

function FitxaImmoble(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams() // undefined a /immobles/nou
  const [immoble, setImmoble] = useState<Immoble | null>(null)
  const [carregant, setCarregant] = useState(id !== undefined)

  useEffect(() => {
    if (id === undefined) return
    let cancelat = false
    window.api.inmobles.obtenirUn(Number(id)).then((resposta) => {
      if (cancelat) return
      if (esOk(resposta)) setImmoble(resposta.dades)
      setCarregant(false)
    })
    // Si el component es desmunta abans que arribi la resposta, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [id])

  const noTrobat = id !== undefined && !carregant && immoble === null

  return (
    <>
      <Title order={2} mb="md">
        {id !== undefined ? t('immobles.editar') : t('immobles.nou')}
      </Title>

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
      {!carregant && !noTrobat && <FormulariImmoble immoble={immoble} />}
    </>
  )
}

export default FitxaImmoble
