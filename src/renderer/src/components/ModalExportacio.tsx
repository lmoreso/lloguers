import { useEffect, useState } from 'react'
import { Button, Fieldset, Group, Modal, Radio, Stack } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { ExtensioExportacio } from '../../../shared/tipus'
import { esFormatExportacio } from '../../../shared/validacions'

interface Props {
  obert: boolean
  titol: string
  onAcceptar: (extensio: ExtensioExportacio) => void
  onCancellar: () => void
}

function ModalExportacio({ obert, titol, onAcceptar, onCancellar }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [format, setFormat] = useState<ExtensioExportacio>('csv')

  useEffect(() => {
    if (!obert) return

    const carregarConfig = async (): Promise<void> => {
      const resultat = await window.api.config.obtenir()

      if (resultat.ok && esFormatExportacio(resultat.dades.formatExportacio)) {
        setFormat(resultat.dades.formatExportacio)
      }
    }

    void carregarConfig()
  }, [obert])

  const acceptar = async (): Promise<void> => {
    const resultat = await window.api.config.desar({ formatExportacio: format })

    if (resultat.ok) {
      onAcceptar(format)
    }
  }

  return (
    <Modal opened={obert} onClose={onCancellar} title={titol} centered>
      <Fieldset legend={t('exportacio.format')}>
        <Radio.Group value={format} onChange={(valor) => setFormat(valor as ExtensioExportacio)}>
          <Stack gap="sm">
            <Radio value="csv" label="CSV" description={t('exportacio.csvDescripcio')} />
            <Radio value="ods" label="ODS" description={t('exportacio.odsDescripcio')} />
            <Radio value="xlsx" label="XLSX" description={t('exportacio.xlsxDescripcio')} />
          </Stack>
        </Radio.Group>
      </Fieldset>

      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={onCancellar}>
          {t('comu.cancellar')}
        </Button>
        <Button onClick={() => void acceptar()}>{t('comu.acceptar')}</Button>{' '}
      </Group>
    </Modal>
  )
}

export default ModalExportacio
