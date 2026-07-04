import { SntUiProvider, LocaleProvider } from '@sensolus/snt-agent-kit'
import { WidgetShowcase } from './WidgetShowcase'

export default function App() {
  return (
    <SntUiProvider navigate={(to) => console.log('[showcase] navigate ->', to)}>
      <LocaleProvider>
        <WidgetShowcase />
      </LocaleProvider>
    </SntUiProvider>
  )
}
