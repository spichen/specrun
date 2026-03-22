#!/usr/bin/env python3
"""Web search tool: reads JSON from stdin, writes JSON to stdout."""
import sys
import json

args = json.load(sys.stdin)
query = args.get("query", "")

# Placeholder implementation
results = f"Search results for: {query}\n\n1. Result 1: Information about {query}\n2. Result 2: More details about {query}\n3. Result 3: Additional context for {query}"

json.dump({"results": results}, sys.stdout)
