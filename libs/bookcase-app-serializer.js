const { maybe, camelizeProps } = require('./utils');
const { BadDataError } = require('./errors');

class BookcaseAppSerializer {
  constructor(options = {}) {
    this.metaFor = options.metaFor || function() {};
    this.hrefFor = options.hrefFor || function() {};
  }

  deserializeRecord(payload) {
    if (maybe(payload).prop('data.type').value() !== 'wikis') {
      throw new BadDataError('Resource type must be wikis');
    }
    let meta = maybe(payload).prop('meta').bind(camelizeProps);
    let attrs = maybe(payload).prop('data.attributes').bind(camelizeProps);
    if (!attrs.prop('path').value()) {
      throw new BadDataError('Resource is malformed');
    }
    return { data: attrs.value(), meta: meta.value({}) };
  }

  serialize(resources, meta) {
    let json;
    if (Array.isArray(resources)) {
      json = { data: resources.map(resource => this.serializeRecord(resource)) };
    } else {
      json = { data: this.serializeRecord(resources) };
    }
    if (meta) {
      json.meta = meta;
    }
    return json;
  }

  serializeRecord(instance) {
    let type = 'wikis';
    let id = instance.slug;
    let attributes = {
      'created-at': instance.createdAt,
      title: instance.wikiTitle,
      path: instance.wikiPath,
      'is-running': instance.isRunning,
      href: this.hrefFor(instance)
    };
    let meta = this.metaFor(instance);
    let data = { id, type, attributes };
    if (meta) {
      data.meta = meta;
    }
    return data;
  }

  serializeErrors(errors) {
    return {
      errors: errors.map(error => this.serializeError(error))
    };
  }

  serializeError(error) {
    return {
      code: error.code,
      message: error.message,
      status: error.status
    };
  }
}

module.exports = BookcaseAppSerializer;
