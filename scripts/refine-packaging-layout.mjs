/** Apply the packaging presentation to an existing CMS snapshot; all other records are retained. */
export function refinePackagingLayout(state) {
  const home = state.pageLayouts.find(layout => layout.key === 'home');
  for (const block of home?.data.content ?? []) {
    const props = block.props;
    props.localizedText ??= {};
    if (block.type === 'HomeNavigation') {
      props.ctaLabel = 'Request a quote';
      props.localizedText.en = { ...(props.localizedText.en ?? {}), ctaLabel: 'Request a quote' };
      props.localizedText.zh = { ...(props.localizedText.zh ?? {}), ctaLabel: '发送询盘' };
    }
    if (block.type === 'ProductList') {
      Object.assign(props, { eyebrow: 'FIND YOUR PACKAGING', title: 'A tin for every idea', body: 'Explore our collections by product use.' });
      props.localizedText.zh = { ...(props.localizedText.zh ?? {}), eyebrow: '寻找适合的包装', title: '让每个想法都有合适的铁盒', body: '按产品用途探索我们的铁盒系列。' };
    }
    if (block.type === 'HeroSection') {
      Object.assign(props, { metric1Value: 'Custom shapes', metric1Label: 'Food, gifts, beauty, tea, coffee and candles', metric2Value: 'Print & finish', metric2Label: 'Color, embossing and inserts', metric3Value: 'Export packing', metric3Label: 'Inspection and shipment support' });
    }
  }
  const parent = state.navigation.find(item => item.enabled && item.href === '/products' && !item.parentId);
  if (parent) {
    for (const category of state.products) {
      const href = `/products/${category.slug}`;
      const item = state.navigation.find(item => item.href === href);
      // Reuse the existing CMS categories in the Products dropdown.
      if (item) Object.assign(item, { enabled: true, parentId: parent.id });
    }
  }
  // Restore this article's existing uploaded photos after verifying their public URLs.
  const wedding = state.articles.find(article => article.slug === 'wedding-candy-tins-small-medium');
  const weddingPhotos = ['file-1790364686673-wm-5b1e7c5c', 'file-1790364686676-wm-6b5ddbe7', 'file-1790364686681-wm-4a2eaa9c', 'file-1790364686685-wm-3a79f23f', 'file-1790364686689-wm-a834d6b0', 'file-1790329809045-befdd2db', 'file-1790364686694-wm-70157ee9'];
  if (wedding?.body) {
    for (const locale of ['en', 'zh']) {
      const missing = weddingPhotos.filter(id => !wedding.body[locale]?.includes(`/api/files/${id}`));
      if (missing.length) wedding.body[locale] = `${wedding.body[locale] ?? ''}\n\n## ${locale === 'zh' ? '更多产品图片' : 'More product views'}\n\n${missing.map((id, index) => `![${locale === 'zh' ? '婚礼糖果铁盒' : 'Wedding candy tin'} — ${index + 1}](/api/files/${id})`).join('\n\n')}`;
    }
  }
  return state;
}
