class Specrun < Formula
  desc "Lightweight CLI agentic workflow framework"
  homepage "https://github.com/spichen/specrun"
  url "https://github.com/spichen/specrun/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "" # Replace with actual SHA256 after first release
  license "MIT"

  depends_on "node@20"

  def install
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
