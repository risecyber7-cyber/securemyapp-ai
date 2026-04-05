import { randomUUID } from "node:crypto";

function createCollection() {
  return new Map();
}

export const db = {
  workspaces: createCollection(),
  targetSites: createCollection(),
  scans: createCollection(),
  findings: createCollection(),
  remediations: createCollection(),
  reports: createCollection(),
};

export function createId(prefix) {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

export function insert(collectionName, entity) {
  db[collectionName].set(entity.id, entity);
  return entity;
}

export function getOne(collectionName, id, entityName) {
  const value = db[collectionName].get(id);
  if (!value) {
    const error = new Error(`${entityName} not found`);
    error.statusCode = 404;
    throw error;
  }

  return value;
}

export function listWhere(collectionName, predicate) {
  return Array.from(db[collectionName].values()).filter(predicate);
}
