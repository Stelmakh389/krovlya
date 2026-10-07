#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ROOT_DIR}/.env.deploy"
IGNORE_FILE="${ROOT_DIR}/.deployignore"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing .env.deploy"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

: "${DEPLOY_HOST:?Missing DEPLOY_HOST}"
: "${DEPLOY_PORT:=22}"
: "${DEPLOY_USER:?Missing DEPLOY_USER}"
: "${DEPLOY_PASSWORD:?Missing DEPLOY_PASSWORD}"
: "${DEPLOY_PATH:?Missing DEPLOY_PATH}"

if ! command -v sshpass >/dev/null 2>&1; then
  echo "sshpass is required"
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required"
  exit 1
fi

RSYNC_DELETE=""

if [[ "${DEPLOY_DELETE:-false}" == "true" ]]; then
  RSYNC_DELETE="--delete"
fi

export SSHPASS="${DEPLOY_PASSWORD}"

SSH_COMMAND=(
  sshpass -e ssh
  -p "${DEPLOY_PORT}"
  -o StrictHostKeyChecking=accept-new
  -o UserKnownHostsFile="${ROOT_DIR}/.known_hosts.deploy"
)

echo "Deploying to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"

"${SSH_COMMAND[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${DEPLOY_PATH}'"

rsync -az --progress --stats \
  ${RSYNC_DELETE} \
  --exclude-from="${IGNORE_FILE}" \
  --chmod=Du=rwx,Dg=rx,Do=rx,Fu=rw,Fg=r,Fo=r \
  -e "${SSH_COMMAND[*]}" \
  "${ROOT_DIR}/" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "Deploy complete"
