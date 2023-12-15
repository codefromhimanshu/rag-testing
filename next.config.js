/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "md", "jsx", "js", "tsx", "ts"],
  experimental: {
    serverComponentsExternalPackages: ["sequelize", "sequelize-typescript"],
  },
};

module.exports = nextConfig;
