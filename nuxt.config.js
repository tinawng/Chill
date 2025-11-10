export default defineNuxtConfig({
  ssr: false,
  app: {
    head: {
      title: "Chill Player ~ Tina Wang",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "description",
          content: "Chill Player ~ Tina Wang",
        },
      ],
      htmlAttrs: {
        lang: "en",
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  modules: ["@nuxtjs/tailwindcss"],

  css: ["@/assets/css/base.postcss"],
  tailwindcss: { viewer: false },
})
