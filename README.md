# api
API for gaining cloud privileges

- list deployments
- delete deployment
- send feedback

## Usage

Provide credentials via the following environment variables

- ZEIT_API_TOKEN
- GMAIL_USER
- GMAIL_PASS
- GMAIL_ADDRESS
- YOUTUBE_KEY
- ADMIN_USERNAME
- ADMIN_PASSWORD

Prepare the directories required by MongoDB for local operation:
(here <user> is the user that will be running `mongod`)
```
sudo mkdir -p /data/db
sudo chown <user> /data/db
sudo mkdir -p /srv/mongodb/rs0-0  /srv/mongodb/rs0-1 /srv/mongodb/rs0-2
sudo chown -R <user> /srv/mongodb
```
