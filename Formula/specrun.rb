class Specrun < Formula
  desc "Lightweight CLI agentic workflow framework"
  homepage "https://github.com/spichen/specrun"
  url "https://github.com/spichen/specrun/archive/refs/tags/v0.1.0-beta5.tar.gz"
  sha256 "8cc5a048a49a9db375ae547b89fb4134f81e209e628b74c182b639ca6ce4c21f"
  license "MIT"

  depends_on "node@20"

  # agentspec is referenced as file:../agent-spec/tsagentspec in package.json
  # and is not published to npm, so we fetch and build it from source
  resource "agentspec" do
    url "https://github.com/spichen/agent-spec/archive/f549737b72eb243a3aff79ec42a603ff84bc6684.tar.gz"
    sha256 "7caa24f8109e2dad43e11004d3d28944c4a250c006d4084aea457534d3d4c270"
  end

  def install
    # Stage agentspec at the relative path expected by package.json
    agentspec_dir = buildpath.parent/"agent-spec"/"tsagentspec"
    resource("agentspec").stage do
      (agentspec_dir).install Dir["tsagentspec/*"]
    end

    # Build agentspec first (dist/ is gitignored so we must build it)
    cd agentspec_dir do
      system "npm", "ci"
      system "npm", "run", "build"
    end

    # Now build specrun (tsup bundles agentspec into dist via noExternal)
    system "npm", "ci"
    system "npm", "run", "build"

    # Install the built dist + package files
    libexec.install "dist", "node_modules", "package.json"

    # Create a wrapper script that uses the bundled node
    (bin/"specrun").write <<~SH
      #!/bin/bash
      exec "#{Formula["node@20"].opt_bin}/node" "#{libexec}/dist/index.js" "$@"
    SH
  end

  test do
    assert_match "Usage:", shell_output("#{bin}/specrun --help")
  end
end
