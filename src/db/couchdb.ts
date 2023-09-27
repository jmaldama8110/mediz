import PouchDB from 'pouchdb';
import pouchDbFind from 'pouchdb-find';
PouchDB.plugin( pouchDbFind );

export const db = new PouchDB(import.meta.env.VITE_COUCHDB_NAME);
export const remoteDB = new PouchDB(`${import.meta.env.VITE_COUCHDB_PROTOCOL}://${import.meta.env.VITE_COUCHDB_USER}:${import.meta.env.VITE_COUCHDB_PASS}@${import.meta.env.VITE_COUCHDB_HOST}:${import.meta.env.VITE_COUCHDB_PORT}/${import.meta.env.VITE_COUCHDB_NAME}`);

