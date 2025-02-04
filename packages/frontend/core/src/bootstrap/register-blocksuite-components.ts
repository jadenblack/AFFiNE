import {
  registerFramePanelComponents,
  registerTOCPanelComponents,
} from '@blocksuite/presets';

registerTOCPanelComponents(components => {
  for (const compName in components) {
    if (window.customElements.get(compName)) continue;

    window.customElements.define(
      compName,
      components[compName as keyof typeof components]
    );
  }
});

registerFramePanelComponents(components => {
  for (const compName in components) {
    if (window.customElements.get(compName)) continue;

    window.customElements.define(
      compName,
      components[compName as keyof typeof components]
    );
  }
});
