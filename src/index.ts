/// <reference path="../typings/index.d.ts" />
import assign = require('object-assign')

/**
 * Copyright 2016 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */

/**
 * @public
 * @factory
 * @param {url: string, id: string} config
 * @return {Cryptoboxes}
 * @throws Error 'invalid credentials' when
 * - creds is not a valid credentials object {url: string, id: string}
 * - or a cryptobox instance already exists for the given creds.id
 */
export default function getFactory (config: Config): Cryptoboxes {
  if (!isConfig(config)) {
    throw new Error('invalid argument')
  }

  return Cryptobox.prototype.cryptoboxes = Object.freeze({
    create: Cryptobox,
    access: getCryptobox,
    config: Object.freeze(assign({}, config)) // defensive copy
  })
}

export interface Config {
  url: string
  agent: string
}

export interface Creds {
  id: string,
  secret: string
}

export interface Cryptoboxes {
  create (creds: Creds): Cryptobox
  access (creds: Creds): Cryptobox
  config: Config
}

export interface Cryptobox {
  cryptoboxes: Cryptoboxes
}

let _pool = Object.create(null) // TODO should be local pouchdb instances

/**
 * @public
 * @factory
 * @param {id: string, secret: string} creds
 * @return {Cryptobox} new immutable instance for given creds
 * @throws Error 'invalid credentials' when
 * - creds is not a valid credentials object
 * - or a cryptobox instance already exists for the given creds.id
 */
function Cryptobox (creds: Creds): Cryptobox {
  if (!isCreds(creds) || (creds.id in _pool)) {
    throw new Error('invalid credentials')
  }

  let _creds = Object.freeze({ // defensive copy
    id: creds.id,
    hash: creds.secret // TODO SHA256(creds.secret)
  })

  let cryptobox = Object.freeze(Object.create(Cryptobox.prototype))

  _pool[_creds.id] = function access (creds: Creds): Cryptobox {
    if (!isCreds(creds) || (creds.id !== _creds.id)
    || (creds.secret !== _creds.hash)) { // TODO SHA256(creds.secret) !== _creds.hash
      throw new TypeError('invalid credentials')
    }
    return cryptobox
  }

  return cryptobox
}

/**
 * @public
 * @param {id: string, secret: string} creds
 * @return {Cryptobox} for given creds
 * @throws Error 'invalid credentials' when
 * - creds is not a valid credentials object
 * - or there is no cryptobox instance for the given creds.id
 * - or creds does not match that of the corresponding cryptobox instance
 */
function getCryptobox (creds: Creds): Cryptobox {
  if (!isCreds(creds) || !(creds.id in _pool)) {
    throw new Error('invalid credentials')
  }

  return _pool[creds.id](creds)
}

/**
 * @private
 * @param {id: string, secret: string} creds
 * @return {boolean} true if creds is a valid credentials object
 */
function isCreds(creds: any): creds is Creds {
  return creds && (typeof creds.id === 'string')
    && (typeof creds.secret === 'string')
}

/**
 * @private
 * @param {url: string, id: string} config
 * @return {boolean} true if config is a valid Config object
 */
function isConfig(config: any): config is Config {
  return config && (typeof config.url === 'string')
    && (typeof config.agent === 'string')
}