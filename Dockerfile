FROM oven/bun:latest AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/prod/node_modules node_modules
COPY . .
# build
RUN bun --bun run generate
# compress
RUN apt update
RUN apt install brotli
RUN find .output/public/ \( -iname '*.html' -o -iname '*.css' -o -iname '*.js' \) -exec bash -c 'brotli --best "$0"' {} \;
RUN find .output/public/ \( -iname '*.html' -o -iname '*.css' -o -iname '*.js' \) -exec bash -c 'gzip -k --best "$0"' {} \;

FROM tinawng/nginx-static-compressed:latest AS release
COPY --from=prerelease /usr/src/app/.output/public /static