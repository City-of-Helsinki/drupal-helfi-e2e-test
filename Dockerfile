FROM registry.access.redhat.com/ubi10/nodejs-22

ENV npm_config_cache="/tmp/.npm"

WORKDIR "/app"
COPY --chown=default:0 / "/app/"

RUN npm ci
RUN npx playwright install --with-deps

CMD ["npm", "run", "test"]