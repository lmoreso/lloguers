import { useEffect, useState } from 'react'
import { Button, Text, Title } from '@mantine/core'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adreca } from '../utils/adreca'
import { esOk } from '../utils/resultat'
import type { Immoble } from '../../../shared/tipus'

// Contractes d'un immoble. S'hi entra només des d'Immobles (/immobles/:id/contractes).
function Contractes(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [immoble, setImmoble] = useState<Immoble | null>(null)
  const [carregant, setCarregant] = useState(true)

  useEffect(() => {
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

  return (
    <>
      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}

      {!carregant && immoble === null && <Text c="dimmed">{t('immobles.noTrobat')}</Text>}

      {immoble && (
        <Title order={2} mb="md">
          {t('contractes.titolImmoble', { adreca: adreca(immoble) })}
        </Title>
      )}

      <Button variant="default" onClick={() => navigate('/immobles')}>
        {t('comu.tornar')}
      </Button>
    </>
  )
}

export default Contractes
