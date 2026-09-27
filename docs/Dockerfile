# Local build environment for the GitHub Pages site in this directory.
#
# GitHub Pages builds this site with the classic Pages builder, which runs the
# `github-pages` gem on the Ruby version listed at
# https://pages.github.com/versions.json. Keep the Ruby version below in sync
# with that list, and keep the gem version in Gemfile.lock in sync with the
# `github-pages` entry.
FROM ruby:3.3.4-slim-bookworm@sha256:7bb0e1e46378217ce0775845f6d64b039c56d2890bc715536e6687ab13fe2930

# Native extensions in the Pages gem set (eventmachine, commonmarker, ffi)
# need a compiler; jekyll-github-metadata shells out to git.
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential git \
    && rm -rf /var/lib/apt/lists/*

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

WORKDIR /srv/jekyll

COPY Gemfile Gemfile.lock ./
RUN bundle install

# 4000: Jekyll server, 35729: LiveReload
EXPOSE 4000 35729

# Polling makes file watching work through Docker Desktop bind mounts.
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--livereload", "--force_polling"]
