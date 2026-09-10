import fs from 'fs';
import { ZH_TW, ZH_TW_PATTERNS } from '../js/i18n/dict.zh-TW.js';

// 1. Vocabulary that differs between Taiwan and Mainland usage.
//    These map straight to the finished simplified form and are protected
//    from the character pass below. Applied longest-first.
const VOCAB = {
  '應用程式': '应用程序', '程式': '程序',
  '網路': '网络', '資訊': '信息',
  '資料庫': '数据库', '資料': '数据',
  '記憶體': '内存', '映像檔': '镜像', '檔案': '文件',
  '磁碟': '磁盘', '硬碟': '硬盘',
  '預設': '默认', '伺服器': '服务器', '叢集': '集群',
  '使用者': '用户', '存取': '访问',
  '萬用字元': '通配符', '逾時': '超时',
  '效能': '性能', '最佳化': '优化', '佇列': '队列', '迴圈': '循环',
  '指令列': '命令行', '命令列': '命令行', '指令': '命令', '終端機': '终端',
  '選單': '菜单', '清單': '列表', '分頁': '标签页',
  '檢視器': '查看器', '檢視': '查看',
  '格線': '网格', '重設': '重置', '復原': '撤销',
  '匯出': '导出', '匯入': '导入', '連段': '连击',
  '服務探索': '服务发现', '探索': '发现', '除錯': '调试',
  '排程器': '调度器', '排程': '调度',
  '政策': '策略', '出向': '出站', '入向': '入站',
  '曝露': '暴露', '身分': '身份', '稽核': '审计', '偵測': '检测',
  '相符': '匹配', '對得上': '匹配',
  '雲端供應商': '云服务商', '雲端': '云',
  '主機名稱': '主机名', '名稱': '名称',
  '連線': '连线', '平行': '并行', '註冊': '注册', '建置': '构建',
  '洩漏': '泄漏', '外洩': '泄露', '輪替': '轮换',
  '時間窗': '时间窗口',
  'TLS 憑證': 'TLS 证书', '憑證': '凭证',
  '介面': '界面', '快取': '缓存', '設定': '设置',
  '拖曳': '拖拽', '反覆': '反复', '搜尋': '搜索'
};

// 2. Traditional -> Simplified, covering every traditional character
//    that actually appears in the zh-TW dictionary.
const CHARS = {
  並: '并', 佈: '布', 佔: '占', 係: '系', 來: '来', 個: '个', 們: '们',
  倖: '幸', 偵: '侦', 備: '备', 儲: '储', 優: '优', 內: '内', 兩: '两',
  冊: '册', 別: '别', 刪: '删', 則: '则', 剛: '刚', 創: '创', 動: '动',
  務: '务', 匯: '汇', 區: '区', 參: '参', 叢: '丛', 員: '员', 問: '问',
  啟: '启', 單: '单', 嚴: '严', 圖: '图', 執: '执', 報: '报', 場: '场',
  塊: '块', 壓: '压', 壘: '垒', 壞: '坏', 夠: '够', 夢: '梦', 學: '学',
  實: '实', 寫: '写', 寬: '宽', 將: '将', 專: '专', 尋: '寻', 對: '对',
  導: '导', 層: '层', 屬: '属', 師: '师', 帶: '带', 幫: '帮', 幾: '几',
  庫: '库', 廳: '厅', 強: '强', 徑: '径', 從: '从', 復: '复', 惡: '恶',
  慮: '虑', 憑: '凭', 憶: '忆', 應: '应', 戰: '战', 戲: '戏', 擋: '挡',
  擬: '拟', 擴: '扩', 攏: '拢', 數: '数', 斂: '敛', 斷: '断', 於: '于',
  時: '时', 暫: '暂', 會: '会', 業: '业', 極: '极', 構: '构', 標: '标',
  樣: '样', 機: '机', 檔: '档', 檢: '检', 欄: '栏', 權: '权', 歷: '历',
  歸: '归', 決: '决', 沒: '没', 況: '况', 洩: '泄', 測: '测', 準: '准',
  滾: '滚', 滿: '满', 潰: '溃', 瀏: '浏', 為: '为', 無: '无', 營: '营',
  產: '产', 畢: '毕', 當: '当', 發: '发', 監: '监', 盡: '尽', 確: '确',
  碼: '码', 礎: '础', 稱: '称', 積: '积', 穩: '稳', 節: '节', 範: '范',
  築: '筑', 簡: '简', 籤: '签', 紀: '纪', 紅: '红', 級: '级', 終: '终',
  組: '组', 結: '结', 絕: '绝', 給: '给', 統: '统', 綁: '绑', 經: '经',
  維: '维', 網: '网', 緊: '紧', 緒: '绪', 線: '线', 編: '编', 練: '练',
  縮: '缩', 總: '总', 績: '绩', 繼: '继', 續: '续', 與: '与', 舊: '旧',
  萬: '万', 蓋: '盖', 處: '处', 虛: '虚', 號: '号', 衝: '冲', 補: '补',
  裡: '里', 裝: '装', 製: '制', 複: '复', 見: '见', 規: '规', 視: '视',
  覽: '览', 觀: '观', 觸: '触', 計: '计', 訊: '讯', 訓: '训', 記: '记',
  設: '设', 許: '许', 診: '诊', 註: '注', 評: '评', 詢: '询', 試: '试',
  話: '话', 該: '该', 認: '认', 語: '语', 誤: '误', 說: '说', 調: '调',
  請: '请', 證: '证', 議: '议', 護: '护', 讀: '读', 變: '变', 讓: '让',
  貓: '猫', 負: '负', 責: '责', 費: '费', 資: '资', 賽: '赛', 較: '较',
  載: '载', 輪: '轮', 輯: '辑', 輸: '输', 辦: '办', 迴: '回', 遊: '游',
  運: '运', 過: '过', 達: '达', 適: '适', 遲: '迟', 選: '选', 還: '还',
  邊: '边', 這: '这', 連: '连', 進: '进', 釋: '释', 針: '针', 鈕: '钮',
  鈴: '铃', 錄: '录', 錯: '错', 鍵: '键', 鎖: '锁', 鏈: '链', 鏡: '镜',
  鐘: '钟', 鐺: '铛', 長: '长', 門: '门', 閃: '闪', 閉: '闭', 開: '开',
  閒: '闲', 間: '间', 關: '关', 陰: '阴', 階: '阶', 際: '际', 隨: '随',
  險: '险', 隱: '隐', 離: '离', 難: '难', 雲: '云', 響: '响', 頁: '页',
  項: '项', 順: '顺', 須: '须', 預: '预', 頭: '头', 顆: '颗', 題: '题',
  額: '额', 類: '类', 顧: '顾', 顯: '显', 風: '风', 飆: '飙', 餘: '余',
  驅: '驱', 驗: '验', 驟: '骤', 體: '体', 麼: '么', 點: '点', 齊: '齐',
  減: '减', 牽: '牵', 狀: '状', 獨: '独', 獵: '猎', 現: '现', 環: '环',
  畫: '画', 條: '条', 掛: '挂', 換: '换', 撐: '撑', 敗: '败', 後: '后',
  態: '态', 義: '义', 聲: '声', 種: '种', 農: '农', 獲: '获',
  '「': '“', '」': '”'
};

// Traditional-only characters that must never survive into the output.
// Guards against a character being wrongly assumed script-neutral.
const TRAD_ONLY = '們個來時對會發後點國經濟說話語讀寫學實體並無為與從業種農產應戰動務員問題網練級線終組結給統維編縮總續舊萬處虛號補裡裝製複見規視覽觀觸計訊訓記設許診註評詢試該認誤請證議護變讓貓負責費資賽較載輪輯輸辦遊運過達適遲選還邊這連進釋針鈕鈴錄錯鍵鎖鏈鏡鐘長門閃閉開閒間關陰階際隨險隱離難雲響頁項順須預頭顆額類顧顯風餘驅驗驟麼齊減牽狀獨獵現環畫條掛換撐敗態義聲區參叢單嚴圖執報場塊壓壞夠夢寬將專尋導層屬師帶幫幾庫廳強徑復惡慮憑憶擋擬擴數斷於暫極構標樣機檔檢欄權歷歸決沒況洩測準滾滿潰瀏營畢當監盡確碼礎稱積穩節範築簡籤紀紅絕綁績緊緒優儲內兩冊別刪則剛創匯佈佔係倖偵備';

const vocabKeys = Object.keys(VOCAB).sort((a, b) => b.length - a.length);

function convert(text) {
  const held = [];
  let s = text;
  for (const k of vocabKeys) {
    if (!s.includes(k)) continue;
    s = s.split(k).join(`\u0000${held.length}\u0000`);
    held.push(VOCAB[k]);
  }
  s = [...s].map((c) => CHARS[c] || c).join('');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => held[Number(i)]);
}

const ZH_CN = {};
for (const [k, v] of Object.entries(ZH_TW)) ZH_CN[k] = convert(v);

// ---- verification --------------------------------------------------------
const srcChars = new Set([...Object.keys(CHARS), ...TRAD_ONLY]);
const leftovers = new Map();
const checked = [
  ...Object.entries(ZH_CN),
  ...ZH_TW_PATTERNS.map(([re, tpl]) => [`pattern ${re}`, convert(tpl)])
];
for (const [k, v] of checked) {
  for (const c of v) if (srcChars.has(c)) {
    if (!leftovers.has(c)) leftovers.set(c, k);
  }
}
if (leftovers.size) {
  console.error('UNCONVERTED CHARS:', [...leftovers.entries()].map(([c, k]) => `${c} (in "${k}")`).join(', '));
  process.exit(1);
}

// Every CJK char in the output, so leftovers can be eyeballed.
const outChars = new Set();
for (const v of Object.values(ZH_CN)) for (const c of v) if (/[\u4e00-\u9fff]/.test(c)) outChars.add(c);

// ---- emit ----------------------------------------------------------------
const lines = [];
lines.push('// 简体中文字典 —— 由 dict.zh-TW.js 转换生成，请勿手动编辑。');
lines.push('// 生成脚本：tools/gen-zh-cn.mjs（繁简字表 + 台湾／大陆用词对照）。');
lines.push('//');
lines.push('// 原则：Kubernetes 专有名词一律保留英文 —— 资源类型（Pod、Deployment、Service…）、');
lines.push('// kubectl 命令、字段名（spec.replicas）、事故代号（CrashLoopBackOff、OOMKilled）。');
lines.push('');
lines.push('const ZH_CN = {');
for (const [k, v] of Object.entries(ZH_CN)) {
  lines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
}
lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
lines.push('};');
lines.push('');
lines.push('const ZH_CN_PATTERNS = [');
for (const [re, tpl] of ZH_TW_PATTERNS) {
  lines.push(`  [${re.toString()}, ${JSON.stringify(convert(tpl))}],`);
}
lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
lines.push('];');
lines.push('');
lines.push('export { ZH_CN, ZH_CN_PATTERNS };');
lines.push('');

fs.writeFileSync(new URL('../js/i18n/dict.zh-CN.js', import.meta.url), lines.join('\n'), 'utf8');
console.log('entries:', Object.keys(ZH_CN).length);
console.log('patterns:', ZH_TW_PATTERNS.length);
console.log('output CJK chars:', outChars.size);
console.log('no unconverted traditional characters found.');
