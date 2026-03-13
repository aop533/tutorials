export default class Loader {

  /**
   * 同時載入多個 URL，依照傳入順序回傳結果
   * @param  {...string} urls
   * @returns {Promise<any[]>}
   */
  async load(...urls) {
    const responses = await Promise.all(
      urls.map(url => fetch(url).then(res => {
        if (!res.ok) throw new Error(`無法載入 ${url}（${res.status}）`);
        return res;
      }))
    );

    return Promise.all(
      responses.map(res => {
        const contentType = res.headers.get('content-type') ?? '';
        return contentType.includes('application/json')
          ? res.json()
          : res.text();
      })
    );
  }
}
