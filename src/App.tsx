import { CanastaProvider } from "./state/CanastaContext";
import { Shell } from "./components/Shell";

export function App() {
  return (
    <CanastaProvider>
      <Shell />
    </CanastaProvider>
  );
}
