/** @type {import('next').NextConfig} */

require("next-ws/server").verifyPatch();

const nextConfig = {
  pageExtensions: ["mdx", "md", "jsx", "js", "tsx", "ts"],
  experimental: {
    serverComponentsExternalPackages: ["sequelize", "sequelize-typescript"],
  },
};

module.exports = nextConfig;
