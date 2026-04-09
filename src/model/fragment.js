// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {  // size defaulted to 0 if missing
    
    if (!ownerId) throw new Error('ownerId is required');                       // ownerId required
    if (!type) throw new Error('type is required');                             // type required
    if (!Fragment.isSupportedType(type)) throw new Error('unsupported type');   // will write isSupportedType() below
    
    if (typeof size !== 'number' || Number.isNaN(size)) {                       // size must be a number
      throw new Error('size must be a number');
    }
    if (size < 0) {                                 // size cannot be negative
      throw new Error('size cannot be negative');
    }

    if (id) {                   // use id passed in if present
      this.id = id;
    } else {                    // else generate one and set it
      this.id = randomUUID();
    }

    this.ownerId = ownerId;
    this.type = type;
    this.size = size;

    const now = new Date().toISOString();
    
    if (created){
      this.created = created;
    } else {
      this.created = now;
    }
    if (updated){
      this.updated = updated;
    } else {
      this.updated = now;
    }
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    // get list of fragment ids from the owner
    const fragIds = await listFragments(ownerId);

    if (!expand) {      // if expand is false, they only wants the ids
      return fragIds;
    }

    // if expand is true, they want full fragment objects for all ids
    const fragments = await Promise.all(fragIds.map((id) => Fragment.byId(ownerId, id)));
    return fragments;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const result = await readFragment(ownerId, id);

    if (!result) {
      const error = new Error('fragment not found');
      error.statusCode = 404;
      throw error;
    }

    return new Fragment(result);    // test awaits an actual Fragment instance
  }

  static async update(ownerId, id, data, type) {
    const fragment = await Fragment.byId(ownerId, id);

    if (!Buffer.isBuffer(data)) {
      throw new Error('data must be a Buffer');
    }

    if (fragment.type !== type) {
      const error = new Error('fragment type cannot be changed');
      error.statusCode = 400;
      throw error;
    }

    await fragment.setData(data);
    return fragment;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    await deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  async save() {
    // update time
    this.updated = new Date().toISOString();
  
    await writeFragment({
      id: this.id,
      ownerId: this.ownerId,
      created: this.created,
      updated: this.updated,
      type: this.type,
      size: this.size,
    });
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    // TIP: make sure you update the metadata whenever you change the data, so they match

    if (!Buffer.isBuffer(data)) throw new Error('data must be a Buffer');  // throws if not a buffer

    // from data/index.js : writeFragmentData(owner, id, buffer)
    await writeFragmentData(this.ownerId, this.id, data);
    
    // update the fragment size
    this.size = data.length;

    // save metadata
    await this.save();
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    if (this.mimeType === 'text/plain') {
      return ['text/plain'];
    }

    if (this.mimeType === 'text/markdown') {
      return ['text/markdown', 'text/html'];
    }

    if (this.mimeType === 'text/html') {
      return ['text/html'];
    }

    if (this.mimeType === 'application/json') {
      return ['application/json'];
    }

    if (this.isText) {
      return [this.mimeType];
    }
    
    // or return an empty array
    return [];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);

      return type.startsWith('text/') || type === 'application/json';
    } catch {
      return false;
    }
  }
}

module.exports.Fragment = Fragment;
