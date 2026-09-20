/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // يتجاهل أخطاء ESLint أثناء البناء
    ignoreDuringBuilds: true,
  },
  typescript: {
    // يتجاهل أخطاء البرمجة النمطية أثناء البناء
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;