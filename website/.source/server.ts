// @ts-nocheck
import * as __fd_glob_8 from "../content/docs/tools.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/nodes.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/llm-providers.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/getting-started.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/flows.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/comparison.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/cli-reference.mdx?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, }, {"cli-reference.mdx": __fd_glob_1, "comparison.mdx": __fd_glob_2, "flows.mdx": __fd_glob_3, "getting-started.mdx": __fd_glob_4, "index.mdx": __fd_glob_5, "llm-providers.mdx": __fd_glob_6, "nodes.mdx": __fd_glob_7, "tools.mdx": __fd_glob_8, });