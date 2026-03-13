import Loader from './loader.js';

export default class App {

  /**
   * @param {HTMLElement} $container - #app 元素
   */
  constructor($container) {
    this.$container = $container;
    this.loader     = new Loader();
    this.templates  = this.#collectTemplates();
  }

  /**
   * 收集 container 內所有 [data-template] 元素
   * @returns {{ [name: string]: HTMLTemplateElement }}
   */
  #collectTemplates() {
    const map = {};
    this.$container
      .querySelectorAll('template[data-template]')
      .forEach(tpl => { map[tpl.dataset.template] = tpl; });
    return map;
  }

  /**
   * clone template，選擇對應的 [data-card] 變體後回傳 element
   * @param {string} templateName
   * @param {string} variant       - data-card 的值（'done' | 'soon'）
   * @param {(el: HTMLElement) => void} fill - 填入資料的 callback
   * @returns {HTMLElement}
   */
  #cloneVariant(templateName, variant, fill) {
    const tpl      = this.templates[templateName];
    const fragment = tpl.content.cloneNode(true);

    // 只保留符合 variant 的元素，移除其他 data-card 變體
    fragment.querySelectorAll('[data-card]').forEach(el => {
      if (el.dataset.card !== variant) el.remove();
    });

    const el = fragment.firstElementChild;
    fill(el);
    return el;
  }

  /**
   * 填入文字內容（使用 [data-bind] 對應欄位名稱）
   * @param {HTMLElement} el
   * @param {object} data
   */
  #bind(el, data) {
    el.querySelectorAll('[data-bind]').forEach(node => {
      const key = node.dataset.bind;
      if (key in data) node.textContent = data[key];
    });
  }

  /**
   * 載入資料並渲染頁面
   * @param {{ categories: string, items: string, config: string }} urls
   */
  render({ categories, items, config }) {
    this.loader
      .load(categories, items, config)
      .then(([categoriesData, itemsData, configData]) => {
        this.#renderPage(categoriesData, itemsData, configData);
      })
      .catch(err => {
        this.$container.innerHTML = `
          <div class="state-msg error">
            ⚠️ ${err.message}<br>
            <small>請確認是否透過伺服器開啟（不能直接點開 HTML 檔案）</small>
          </div>`;
      });
  }

  /**
   * 實際渲染所有分類與卡片
   */
  #renderPage(categories, items, config) {
    // 把 config array 轉成 Set，方便 O(1) 查詢
    const doneSet = new Set(config);

    // 把 items 依 category_id 分組
    const itemsByCategory = items.reduce((map, item) => {
      (map[item.category_id] ??= []).push(item);
      return map;
    }, {});

    // 清除 loading 狀態，保留 template
    this.$container
      .querySelectorAll(':not(template)')
      .forEach(el => el.remove());

    categories.forEach(category => {
      const categoryItems = itemsByCategory[category.id] ?? [];
      if (categoryItems.length === 0) return;

      // clone category template
      const $category = this.#cloneVariant('category', null, el => {
        this.#bind(el, category);
        // 加上 icon 到 title
        const titleEl = el.querySelector('.category-title');
        if (titleEl) titleEl.textContent = `${category.icon} ${category.name}`;
      });

      const $cards = $category.querySelector('.cards');

      categoryItems.forEach(item => {
        const variant  = doneSet.has(item.id) ? 'done' : 'soon';
        const $card    = this.#cloneVariant('item', variant, el => {
          this.#bind(el, item);
          // done 卡片：補上正確的 href
          if (variant === 'done') {
            el.setAttribute('href', `${item.category_id}/${item.id}/`);
          }
        });
        $cards.appendChild($card);
      });

      this.$container.appendChild($category);
    });
  }
}
