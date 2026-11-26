import { TFunction } from 'i18next'
import { DadesExportacio } from '../../../shared/tipus'
import { notifications } from '@mantine/notifications'
import { esOk } from './resultat'

async function exportarDades(dadesExportacio: DadesExportacio, t: TFunction): Promise<void> {
  const resposta =
    dadesExportacio.format === 'csv'
      ? await window.api.exportacio.csv(dadesExportacio)
      : dadesExportacio.format === 'ods'
        ? await window.api.exportacio.ods(dadesExportacio)
        : await window.api.exportacio.xlsx(dadesExportacio)

  if (!esOk(resposta)) {
    console.error('Error en exportació de dades:', resposta.error)
    notifications.show({
      title: t('exportacio.exportError'),
      message: 'Error: ' + resposta.error,
      color: 'red'
    })
  } else if (!resposta.dades.canceled && resposta.dades.filePath) {
    notifications.show({
      title: t('exportacio.exportOk'),
      message: t('exportacio.exportOkDesc') + resposta.dades.filePath,
      color: 'green'
    })
  } else {
    notifications.show({
      message: t('exportacio.exportCancel'),
      color: 'orange'
    })
  }
}

export default exportarDades
