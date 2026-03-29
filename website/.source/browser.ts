// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"cli-reference.mdx": () => import("../content/docs/cli-reference.mdx?collection=docs"), "comparison.mdx": () => import("../content/docs/comparison.mdx?collection=docs"), "flows.mdx": () => import("../content/docs/flows.mdx?collection=docs"), "getting-started.mdx": () => import("../content/docs/getting-started.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "llm-providers.mdx": () => import("../content/docs/llm-providers.mdx?collection=docs"), "nodes.mdx": () => import("../content/docs/nodes.mdx?collection=docs"), "tools.mdx": () => import("../content/docs/tools.mdx?collection=docs"), }),
};
export default browserCollections;