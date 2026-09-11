import { MDXProvider } from "@mdx-js/react";

import Plan from "@plan";
import { planMdxComponents } from "./mdx-components";

function App() {
  return (
    <MDXProvider components={planMdxComponents}>
      <main className="plan-shell">
        <Plan />
      </main>
    </MDXProvider>
  );
}

export default App;
