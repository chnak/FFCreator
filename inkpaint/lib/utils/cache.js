
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextureCache = exports.BaseTextureCache = void 0;
exports.addToBaseTextureCache = addToBaseTextureCache;
exports.addToTextureCache = addToTextureCache;
exports.deleteAllTextureCache = deleteAllTextureCache;
exports.destroyAllTextureCache = destroyAllTextureCache;
exports.destroyAndCleanAllCache = destroyAndCleanAllCache;
exports.destroyBaseTextureCache = destroyBaseTextureCache;
exports.destroyTextureCache = destroyTextureCache;
exports.removeFromBaseTextureCache = removeFromBaseTextureCache;
exports.removeFromTextureCache = removeFromTextureCache;
const TextureCache = Object.create(null);
exports.TextureCache = TextureCache;
const BaseTextureCache = Object.create(null); // global debug vars

exports.BaseTextureCache = BaseTextureCache;
global.InkPaintCache = {
  TextureCache,
  BaseTextureCache
};

function addToTextureCache(texture, id) {
  if (!id) return;
  if (texture.textureCacheIds.indexOf(id) === -1) texture.textureCacheIds.push(id);
  TextureCache[id] = texture;
}

function removeFromTextureCache(texture) {
  if (typeof texture === "string") {
    const textureFromCache = TextureCache[texture];

    if (textureFromCache) {
      const index = textureFromCache.textureCacheIds.indexOf(texture);
      if (index > -1) textureFromCache.textureCacheIds.splice(index, 1);
      delete TextureCache[texture];
      return textureFromCache;
    }
  } else if (texture && texture.textureCacheIds) {
    for (let i = 0; i < texture.textureCacheIds.length; ++i) {
      if (TextureCache[texture.textureCacheIds[i]] === texture) {
        delete TextureCache[texture.textureCacheIds[i]];
      }
    }

    texture.textureCacheIds.length = 0;
    return texture;
  }

  return null;
}

function addToBaseTextureCache(baseTexture, id) {
  if (!id) return;

  if (baseTexture.textureCacheIds.indexOf(id) === -1) {
    baseTexture.textureCacheIds.push(id);
  }

  BaseTextureCache[id] = baseTexture;
}

function removeFromBaseTextureCache(baseTexture) {
  if (typeof baseTexture === "string") {
    const baseTextureFromCache = BaseTextureCache[baseTexture];

    if (baseTextureFromCache) {
      const index = baseTextureFromCache.textureCacheIds.indexOf(baseTexture);

      if (index > -1) {
        baseTextureFromCache.textureCacheIds.splice(index, 1);
      }

      delete BaseTextureCache[baseTexture];
      return baseTextureFromCache;
    }
  } else if (baseTexture && baseTexture.textureCacheIds) {
    for (let i = 0; i < baseTexture.textureCacheIds.length; ++i) {
      delete BaseTextureCache[baseTexture.textureCacheIds[i]];
    }

    baseTexture.textureCacheIds.length = 0;
    return baseTexture;
  }

  return null;
}

function destroyAllTextureCache() {
  let key;

  for (key in TextureCache) {
    TextureCache[key].destroy();
  }

  for (key in BaseTextureCache) {
    BaseTextureCache[key].destroy();
  }
}

function deleteAllTextureCache() {
  let key;

  for (key in TextureCache) {
    delete TextureCache[key];
  }

  for (key in BaseTextureCache) {
    delete BaseTextureCache[key];
  }
}

function destroyAndCleanAllCache() {
  destroyAllTextureCache();
  deleteAllTextureCache();
}

function destroyBaseTextureCache(key) {
  if (!BaseTextureCache[key]) return;
  BaseTextureCache[key].destroy();
  delete BaseTextureCache[key];
}

function destroyTextureCache(key) {
  if (!TextureCache[key]) return;
  TextureCache[key].destroy();
  delete TextureCache[key];
}
//# sourceMappingURL=cache.js.map
