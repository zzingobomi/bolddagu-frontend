/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  experimental: {
    turbo: {
      rules: {
        "*.glsl": {
          loaders: ["raw-loader", "glslify-loader"],
          as: "*.js",
        },
        "*.vs": {
          loaders: ["raw-loader", "glslify-loader"],
          as: "*.js",
        },
        "*.fs": {
          loaders: ["raw-loader", "glslify-loader"],
          as: "*.js",
        },
        "*.vert": {
          loaders: ["raw-loader", "glslify-loader"],
          as: "*.js",
        },
        "*.frag": {
          loaders: ["raw-loader", "glslify-loader"],
          as: "*.js",
        },
      },
    },
  },
};

module.exports = nextConfig;
