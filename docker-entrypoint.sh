#!/bin/sh -x

if [ -z "$@" ]; then
  npm run start
elif [ "$@" = "dev" ] || [ ${NODE_ENV} = 'development' ]; then
  npm install
  npm run dev
else
  exec $@
fi
