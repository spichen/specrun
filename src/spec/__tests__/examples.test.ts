import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadComponent } from '../../cli/util.js';

const examplesDir = join(import.meta.dirname, '../../../examples');

const yamlFiles = readdirSync(examplesDir)
  .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
  .sort();

/** Examples that fail SDK deserialization due to old format, missing plugins, or schema issues. */
const KNOWN_SDK_FAILURES = new Set([
  'agent_calling_flow.yaml',         // old $ref format, $referenced_components only
  'flow_calling_agent.yaml',         // $referenced_components only
  'pyagentspec_example_config.yaml', // old $ref format, $referenced_components only
  'standalone_agent.yaml',           // old $ref format
  'standalone_flow.yaml',            // old $ref format
  'howto_a2aagent.yaml',             // SDK schema mismatch (missing required name)
  'howto_ociagent.yaml',             // SDK lacks OciAgent plugin
  'howto_swarm.yaml',                // SDK schema mismatch (handoff field type)
  'plugin_assistant.yaml',           // SDK lacks PluginRegexNode plugin
  'howto_disaggregated_component_config.yaml', // disaggregated config (components only)
  'howto_disaggregated_main_config.yaml',      // disaggregated config (needs components registry)
]);

describe('oracle agent-spec examples', () => {
  const validFiles = yamlFiles.filter((f) => !KNOWN_SDK_FAILURES.has(f));
  const failingFiles = yamlFiles.filter((f) => KNOWN_SDK_FAILURES.has(f));

  describe('valid examples', () => {
    it.each(validFiles)('%s parses and validates', (file) => {
      const component = loadComponent(join(examplesDir, file));
      const ct = (component as unknown as { componentType: string }).componentType;
      const name = (component as unknown as { name: string }).name;
      expect(ct).toBeTruthy();
      expect(name).toBeTruthy();
    });
  });

  describe('known SDK failures', () => {
    it.each(failingFiles)('%s fails with expected error', (file) => {
      expect(() => loadComponent(join(examplesDir, file))).toThrow();
    });
  });
});
