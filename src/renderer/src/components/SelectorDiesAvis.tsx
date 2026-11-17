import { Group, Slider, Stack, Text } from '@mantine/core'
import { DIES_MINIMS_AVIS, DIES_MAXIMS_AVIS, ClauDiesAvis } from '../../../shared/tipus'
import { esDiesAvis } from '../../../shared/validacions'
import { esOk } from '../utils/resultat'

interface Props {
  label: string
  valor: number
  clau: ClauDiesAvis
  onCanviar: (valor: number) => void
}

function SelectorDiesAvis({ label, valor, clau, onCanviar }: Props): React.JSX.Element {
  async function desar(nouValor: number): Promise<void> {
    if (!esDiesAvis(nouValor)) return

    const resposta = await window.api.config.desar({ [clau]: nouValor })
    if (!esOk(resposta)) return
  }

  return (
    <Stack gap={4}>
      <Text size="sm">{label}</Text>
      <Group gap="md">
        <Slider
          style={{ flex: 1 }}
          min={DIES_MINIMS_AVIS}
          max={DIES_MAXIMS_AVIS}
          step={1}
          value={valor}
          onChange={onCanviar}
          onChangeEnd={(nouValor) => void desar(nouValor)}
          aria-label={label}
        />
        <Text size="sm" w={45} ta="right" fw={500}>
          {valor}
        </Text>
      </Group>
    </Stack>
  )
}

export default SelectorDiesAvis
