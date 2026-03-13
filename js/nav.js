// js/nav.js
// 在每份教學文件頂部插入回首頁導覽列
// 使用方式：<script type="module" src="../../js/nav.js"></script>

const nav = document.createElement('div');
nav.innerHTML = `
  <a href="../../" style="
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.15);
    color: white;
    text-decoration: none;
    font-size: 0.82rem;
    font-weight: 700;
    padding: 5px 14px;
    border-radius: 20px;
    margin-bottom: 12px;
    transition: background 0.15s;
  ">← 回首頁</a>
`;

// 插入到 .doc-header 的最前面
const header = document.querySelector('.doc-header');
if (header) {
  header.insertBefore(nav, header.firstChild);
} else {
  // 找不到 doc-header 就插到 body 最前面
  document.body.insertBefore(nav, document.body.firstChild);
}
