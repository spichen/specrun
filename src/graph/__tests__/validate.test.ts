import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseFlow } from '../../spec/parser.js';
import { compile } from '../compile.js';
import { validate } from '../validate.js';
import { CompiledGraph } from '../types.js';

const testdataDir = join(import.meta.dirname, '../../../testdata');

describe('validate graph', () => {
  it('validates simple flow', () => {
    const data = readFileSync(join(testdataDir, 'simple_flow.json'), 'utf-8');
    const pf = parseFlow(data);
    const cg = compile(pf, {});
    expect(() => validate(cg)).not.toThrow();
  });

  it('validates branching flow', () => {
    const data = readFileSync(
      join(testdataDir, 'branching_flow.json'),
      'utf-8',
    );
    const pf = parseFlow(data);
    const cg = compile(pf, {});
    expect(() => validate(cg)).not.toThrow();
  });

  it('detects orphan node', () => {
    const g = new CompiledGraph(
      'test',
      new Map([
        [
          'start',
          {
            name: 'start',
            type: 'StartNode',
            specNode: { component_type: 'StartNode', name: 'start' } as any,
            executor: {
              execute: async (_: any, input: any) => input,
              branch: () => '',
            },
            edges: [{ from_node: 'start', to_node: 'end' }],
            inputMappings: new Map(),
          },
        ],
        [
          'end',
          {
            name: 'end',
            type: 'EndNode',
            specNode: { component_type: 'EndNode', name: 'end' } as any,
            executor: {
              execute: async (_: any, input: any) => input,
              branch: () => '',
            },
            edges: [],
            inputMappings: new Map(),
          },
        ],
        [
          'orphan',
          {
            name: 'orphan',
            type: 'AgentNode',
            specNode: { component_type: 'AgentNode', name: 'orphan' } as any,
            executor: {
              execute: async (_: any, input: any) => input,
              branch: () => '',
            },
            edges: [],
            inputMappings: new Map(),
          },
        ],
      ]),
      'start',
      [],
    );

    expect(() => validate(g)).toThrow(/orphan.*unreachable/);
  });
});
