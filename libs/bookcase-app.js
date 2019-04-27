const express = require('express');
const bodyParser = require('body-parser');
const trash = require('trash');
const { sortBy } = require('./utils');
const { InvalidWikiError, UniqueInstanceError } = require('./errors');
const SlugFinder = require('./slug-finder');
const TWCreator = require('./tiddlywiki-creator');
const BookcaseAppSerializer = require('./bookcase-app-serializer');
const pkg = require('../package.json');

class BookcaseApp {
  constructor() {
    this.redirectTransform = (identity => identity);
  }

  useRedirectTransform(transform) {
    this.redirectTransform = transform;
  }

  useInstanceManager(instanceManager) {
    this.instanceManager = instanceManager;
  }

  useConfigManager(configManager) {
    this.configManager = configManager;
  }

  buildRouter(prefix) {
    let router = express.Router();
    router.use(bodyParser.json());
    router.get('/', (req, res, next) => this.handleIndex(req, res, next));
    router.post('/', (req, res, next) => this.handleCreate(req, res, next));
    router.get('/:slug', (req, res, next) => this.handleShow(req, res, next));
    router.delete('/:slug', (req, res, next) => this.handleDestroy(req, res, next));
    return router;
  }

  async handleIndex(req, res, next) {
    let instances = this.instanceManager.instances
      .concat()
      .sort(sortBy('createdAt', 'DESC'));
    let payload = this.serializer.serialize(instances, {
      'app-version': pkg.version,
      'default-path': await this.configManager.getDefaultPath()
    });
    res.json(payload);
  }

  async handleShow(req, res, next) {
    let instance = this.instanceManager.getInstance(req.params.slug);
    if (instance) {
      res.json(this.serializer.serialize(instance));
    } else {
      this.handleMissing(req.params.slug, res);
    }
  }

  handleMissing(slug, res) {
    let error = new Error(`Instance ${slug} not found`);
    error.code = 'ENOENT';
    error.status = 404;
    res.status(404).json(this.serializer.serializeErrors([error]));
  }

  handleExisting(error, res) {
    error.code = error.name;
    error.status = 409;
    res.status(409).json(this.serializer.serializeErrors([error]));
  }

  handleBadData(error, res) {
    error.code = error.name;
    error.status = 422;
    res.status(422).json(this.serializer.serializeErrors([error]));
  }

  async handleCreate(req, res, next) {
    let instance, extractedData;
    try {
      extractedData = this.serializer.deserializeRecord(req.body);
    } catch(error) {
      if (error.code !== 'EBADDATA') throw error;
      return this.handleBadData(error, res);
    }
    let { import: isImport } = extractedData.meta;
    let { slug, path: wikiPath } = extractedData.data;
    let buildMethod = isImport ? 'buildInstance' : 'createInstance';
    try {
      slug = slug || await this.generateUniqueSlug(wikiPath);
      instance = await TWCreator[buildMethod]({ slug, path: wikiPath });
      await this.assertIsCreatable(instance);
      await this.instanceManager.addInstance(instance);
      await this.configManager.addWiki(instance);
    } catch(error) {
      if (!['ENOTWIKI', 'ENOTUNIQUE', 'EEXIST'].includes(error.code)) throw error;
      return this.handleExisting(error, res);
    }
    res.status(201).json(this.serializer.serialize(instance));
  }

  async handleDestroy(req, res, next) {
    let { slug } = req.params;
    let instance = this.instanceManager.getInstance(slug);
    if (!instance) return this.handleMissing(slug, res);
    await this.configManager.removeWiki(instance);
    await this.instanceManager.removeInstance(instance);
    await trash(instance.wikiPath, { glob: false });
    res.status(204).end();
  }

  async generateUniqueSlug(wikiPath) {
    let wikiList = await this.configManager.readWikiList();
    let knownSlugs = wikiList.map(wiki => wiki.slug);
    let slugFinder = new SlugFinder(knownSlugs);
    return slugFinder.uniqueSlugForPath(wikiPath);
  }

  async assertIsCreatable(instance) {
    let isValidWiki = await instance.isValidWiki();
    let alreadyExists = this.instanceManager.findByPath(instance.wikiPath);
    if (!isValidWiki) throw new InvalidWikiError(instance.wikiPath);
    if (alreadyExists) throw new UniqueInstanceError(instance.wikiPath);
  }

  get serializer() {
    return new BookcaseAppSerializer({
      hrefFor: instance => this.redirectTransform(instance.slug)
    });
  }
}

module.exports = BookcaseApp;
