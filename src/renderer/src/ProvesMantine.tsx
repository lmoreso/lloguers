import { Button, Group, Paper, Stack, Text, Title, Anchor } from '@mantine/core'

type ProvesMantineProps = {
  onTornar: () => void
}

function ProvesMantine({ onTornar }: ProvesMantineProps): React.JSX.Element {
  return (
    <Stack p="lg" gap="xs">
      <Group justify="space-between">
        <Button variant="subtle" onClick={onTornar}>
          {"← Tornar a l'inici"}
        </Button>

        <Text c="dimmed" size="sm">
          Laboratori de components
        </Text>
      </Group>

      <Title order={2}>Proves de Mantine</Title>

      <Paper withBorder shadow="md" radius="md" p="lg">
        <Stack gap="md">
          <Title order={4}>Primera secció</Title>

          <Text>
            El component Paper crea una superfície delimitada per a agrupar informació relacionada.
          </Text>

          <Group justify="flex-end">
            <Button variant="default">Cancel·lar</Button>
            <Button onClick={() => console.log('Desar')}>Desar</Button>
          </Group>
        </Stack>
      </Paper>

      <Anchor href="https://mantine.dev" target="_blank">
        Visita la web de Mantine
      </Anchor>
    </Stack>
  )
}

export default ProvesMantine
