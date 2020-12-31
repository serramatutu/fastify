![master](https://github.com/serramatutu/fastify/workflows/CI/badge.svg?branch=master)

# fastify

fastify's goal is to be a dependencyless, intuitive [Worker](https://github.com/denoland/deno/blob/44251ce8eaa0def807b9867f73ee23adfb539487/docs/runtime/workers.md)-based parallelization library for [Deno](https://deno.land).

As this is currently a personal project in its very early stages, I'm working on a little [TODO](TODO.md) list which serves as a small roadmap. It will be updated as the project matures.

# development tools

For now, we're using [Prettier](https://prettier.io/) as our code formatter as `deno fmt` currently does not support much customization. You should have it installed globally.

Also, we're using [GNU Make](https://www.gnu.org/software/make/) to facilitate running scripts.

# coverage

| Branch | Coverage |
| ------ | -------- |
| master | ![master](https://github.com/serramatutu/fastify/workflows/CI/badge.svg?branch=master) |
| dev | ![dev](https://github.com/serramatutu/fastify/workflows/CI/badge.svg?branch=dev) |

## git hooks

To install git hooks, run
```
make install-dev
```