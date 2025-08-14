/**
 * نظام البحث الذكي للمواد
 * يدعم البحث بالعربية مع التطبيع والبحث الضبابي
 */

/**
 * تطبيع النص العربي لإزالة التشكيل والتطبيع
 */
export const normalizeArabicText = text => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return (
    text
      // إزالة التشكيل
      .replace(/[\u064B-\u0652]/g, '')
      // توحيد الألف
      .replace(/[آأإ]/g, 'ا')
      // توحيد التاء المربوطة والهاء
      .replace(/ة/g, 'ه')
      // توحيد الياء
      .replace(/ى/g, 'ي')
      // إزالة المسافات الزائدة
      .trim()
      .toLowerCase()
  );
};

/**
 * البحث الضبابي - يجد التطابقات الجزئية
 */
export const fuzzySearch = (searchTerm, targetText, threshold = 0.6) => {
  if (!searchTerm || !targetText) {
    return false;
  }

  const normalizedSearch = normalizeArabicText(searchTerm);
  const normalizedTarget = normalizeArabicText(targetText);

  // البحث المباشر
  if (normalizedTarget.includes(normalizedSearch)) {
    return true;
  }

  // البحث بالكلمات المنفصلة
  const searchWords = normalizedSearch.split(/\s+/);
  const targetWords = normalizedTarget.split(/\s+/);

  let matchCount = 0;
  for (const searchWord of searchWords) {
    for (const targetWord of targetWords) {
      if (targetWord.includes(searchWord) || searchWord.includes(targetWord)) {
        matchCount++;
        break;
      }
    }
  }

  return matchCount / searchWords.length >= threshold;
};

/**
 * البحث في المواد مع الفهرسة الذكية
 */
export const searchMaterials = (materials, searchTerm, options = {}) => {
  const {
    searchFields = ['name', 'description', 'category', 'brand', 'keywords'],
    fuzzyThreshold = 0.6,
    maxResults = 50,
    sortByRelevance = true
  } = options;

  if (!searchTerm || searchTerm.length < 2) {
    return materials.slice(0, maxResults);
  }

  const results = [];

  for (const material of materials) {
    let relevanceScore = 0;
    const matchedFields = [];

    // البحث في كل حقل
    for (const field of searchFields) {
      const fieldValue = material[field];
      if (!fieldValue) {
        continue;
      }

      const fieldText = Array.isArray(fieldValue) ? fieldValue.join(' ') : String(fieldValue);

      // البحث المباشر (أعلى نقاط)
      if (normalizeArabicText(fieldText).includes(normalizeArabicText(searchTerm))) {
        relevanceScore += field === 'name' ? 10 : field === 'description' ? 5 : 3;
        matchedFields.push(field);
      } else if (fuzzySearch(searchTerm, fieldText, fuzzyThreshold)) {
        // البحث الضبابي (نقاط أقل)
        relevanceScore += field === 'name' ? 5 : field === 'description' ? 3 : 1;
        matchedFields.push(field);
      }
    }

    // إضافة نقاط إضافية للتطابق في بداية الاسم
    if (material.name && normalizeArabicText(material.name).startsWith(normalizeArabicText(searchTerm))) {
      relevanceScore += 15;
    }

    if (relevanceScore > 0) {
      results.push({
        ...material,
        _relevanceScore: relevanceScore,
        _matchedFields: matchedFields
      });
    }
  }

  // ترتيب النتائج حسب الصلة
  if (sortByRelevance) {
    results.sort((a, b) => b._relevanceScore - a._relevanceScore);
  }

  return results.slice(0, maxResults);
};

/**
 * إنشاء فهرس للبحث السريع
 */
export const createSearchIndex = materials => {
  const index = new Map();

  materials.forEach((material, materialIndex) => {
    const searchableText = [
      material.name,
      material.description,
      material.category,
      material.brand,
      ...(material.keywords || [])
    ]
      .filter(Boolean)
      .join(' ');

    const normalizedText = normalizeArabicText(searchableText);
    const words = normalizedText.split(/\s+/);

    words.forEach(word => {
      if (word.length >= 2) {
        if (!index.has(word)) {
          index.set(word, new Set());
        }
        index.get(word).add(materialIndex);

        // إضافة البادئات للبحث السريع
        for (let i = 2; i <= word.length; i++) {
          const prefix = word.substring(0, i);
          if (!index.has(prefix)) {
            index.set(prefix, new Set());
          }
          index.get(prefix).add(materialIndex);
        }
      }
    });
  });

  return index;
};

/**
 * البحث باستخدام الفهرس المُحسن
 */
export const searchWithIndex = (materials, searchIndex, searchTerm, maxResults = 50) => {
  if (!searchTerm || searchTerm.length < 2) {
    return materials.slice(0, maxResults);
  }

  const normalizedSearch = normalizeArabicText(searchTerm);
  const searchWords = normalizedSearch.split(/\s+/);

  const candidateIndices = new Set();

  // جمع المرشحين من الفهرس
  searchWords.forEach(word => {
    if (searchIndex.has(word)) {
      searchIndex.get(word).forEach(index => candidateIndices.add(index));
    }

    // البحث في البادئات
    for (const [indexWord, indices] of searchIndex.entries()) {
      if (indexWord.includes(word) || word.includes(indexWord)) {
        indices.forEach(index => candidateIndices.add(index));
      }
    }
  });

  // تقييم المرشحين
  const results = [];
  candidateIndices.forEach(index => {
    const material = materials[index];
    if (material) {
      const searchResult = searchMaterials([material], searchTerm, { maxResults: 1 });
      if (searchResult.length > 0) {
        results.push(searchResult[0]);
      }
    }
  });

  // ترتيب وإرجاع النتائج
  results.sort((a, b) => b._relevanceScore - a._relevanceScore);
  return results.slice(0, maxResults);
};

/**
 * اقتراحات البحث الذكية
 */
export const getSearchSuggestions = (materials, searchTerm, maxSuggestions = 5) => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const suggestions = new Set();
  const normalizedSearch = normalizeArabicText(searchTerm);

  materials.forEach(material => {
    // اقتراحات من الأسماء
    if (material.name) {
      const normalizedName = normalizeArabicText(material.name);
      if (normalizedName.includes(normalizedSearch)) {
        suggestions.add(material.name);
      }
    }

    // اقتراحات من الفئات
    if (material.category) {
      const normalizedCategory = normalizeArabicText(material.category);
      if (normalizedCategory.includes(normalizedSearch)) {
        suggestions.add(material.category);
      }
    }

    // اقتراحات من العلامات التجارية
    if (material.brand) {
      const normalizedBrand = normalizeArabicText(material.brand);
      if (normalizedBrand.includes(normalizedSearch)) {
        suggestions.add(material.brand);
      }
    }
  });

  return Array.from(suggestions).slice(0, maxSuggestions);
};

/**
 * مكون البحث الذكي
 */
export class SmartSearch {
  constructor(materials) {
    this.materials = materials;
    this.searchIndex = createSearchIndex(materials);
  }

  search(searchTerm, options = {}) {
    return searchWithIndex(this.materials, this.searchIndex, searchTerm, options.maxResults);
  }

  getSuggestions(searchTerm, maxSuggestions = 5) {
    return getSearchSuggestions(this.materials, searchTerm, maxSuggestions);
  }

  updateMaterials(newMaterials) {
    this.materials = newMaterials;
    this.searchIndex = createSearchIndex(newMaterials);
  }
}

export default {
  normalizeArabicText,
  fuzzySearch,
  searchMaterials,
  createSearchIndex,
  searchWithIndex,
  getSearchSuggestions,
  SmartSearch
};
