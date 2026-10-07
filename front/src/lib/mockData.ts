// Mock data for offline/static deployment fallback
// 中俄能源装备术语库演示数据

export interface MockDatabase {
  id: number;
  name: string;
  category: string;
  description: string;
  termCount: number;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockTerm {
  id: number;
  dbId: number;
  cnTerm: string;
  ruTerm: string;
  enTerm: string | null;
  definition: string | null;
  context: string | null;
  cultureNote: string | null;
  pos: string | null;
  tags: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export const mockDatabases: MockDatabase[] = [
  {
    id: 1,
    name: "油气开采装备",
    category: "油气领域",
    description: "涵盖油气勘探、钻井、采油、集输等全链条装备术语，包括钻机、抽油机、井口装置等核心设备",
    termCount: 156,
    visibility: "public",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: 2,
    name: "电力设备",
    category: "电力领域",
    description: "发电、输电、变电、配电设备术语，覆盖火电、水电、核电及新能源发电装备",
    termCount: 128,
    visibility: "public",
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-06-05T14:20:00Z",
  },
  {
    id: 3,
    name: "新能源装备",
    category: "新能源",
    description: "风能、太阳能、氢能、生物质能等可再生能源装备术语",
    termCount: 95,
    visibility: "public",
    createdAt: "2024-02-20T10:00:00Z",
    updatedAt: "2024-06-08T16:45:00Z",
  },
  {
    id: 4,
    name: "煤炭机械",
    category: "煤炭领域",
    description: "煤矿开采、掘进、运输、安全设备术语，包含综采装备和井下设备",
    termCount: 82,
    visibility: "public",
    createdAt: "2024-03-01T11:00:00Z",
    updatedAt: "2024-06-03T09:15:00Z",
  },
  {
    id: 5,
    name: "管道与储运",
    category: "储运领域",
    description: "油气管道、储罐、LNG接收站、运输设备等术语",
    termCount: 74,
    visibility: "public",
    createdAt: "2024-03-10T12:00:00Z",
    updatedAt: "2024-06-10T11:00:00Z",
  },
  {
    id: 6,
    name: "石化装备",
    category: "石化领域",
    description: "炼油、化工、化纤等石化行业核心装备术语",
    termCount: 68,
    visibility: "public",
    createdAt: "2024-03-15T13:00:00Z",
    updatedAt: "2024-06-07T15:30:00Z",
  },
];

export const mockCategories = ["油气领域", "电力领域", "新能源", "煤炭领域", "储运领域", "石化领域"];

export const mockPosList = ["名词", "动词", "形容词", "缩写", "专有名词"];

export const mockTerms: MockTerm[] = [
  // 油气开采装备 - 10条
  {
    id: 1, dbId: 1, cnTerm: "钻机", ruTerm: "буровой станок", enTerm: "drilling rig",
    definition: "用于钻凿井眼的成套机械设备，是油气钻井工程的核心装备",
    context: "钻井作业现场：\"启动钻机，准备下钻\"",
    cultureNote: "俄语中буровой станок为通用说法，口语中也常用буровая установка",
    pos: "名词", tags: "钻井,核心设备", version: 1,
    createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: 2, dbId: 1, cnTerm: "钻头", ruTerm: "буровое долото", enTerm: "drill bit",
    definition: "直接破碎岩石形成井眼的工具，按结构分为牙轮钻头、PDC钻头等",
    context: "井下工具选择：\"根据地层硬度选择PDC钻头\"",
    cultureNote: "долото传统指扁铲，在钻井领域特指钻头",
    pos: "名词", tags: "钻井,井下工具", version: 1,
    createdAt: "2024-01-16T08:00:00Z", updatedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: 3, dbId: 1, cnTerm: "钻杆", ruTerm: "бурильная труба", enTerm: "drill pipe",
    definition: "连接钻机与钻头的中空钢管，用于传递扭矩和输送钻井液",
    context: "钻具组合：\"检查钻杆接头密封性\"",
    cultureNote: "труба为通用词，加бурильная限定为钻杆专用",
    pos: "名词", tags: "钻井,钻具", version: 1,
    createdAt: "2024-01-17T08:00:00Z", updatedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: 4, dbId: 1, cnTerm: "套管", ruTerm: "обсадная труба", enTerm: "casing",
    definition: "下入井内用于加固井壁、隔离地层的钢管",
    context: "固井作业：\"下表层套管，水泥浆返至地面\"",
    cultureNote: "обсаживать意为\"围起、圈定\"，обсадная труба字面义为\"围设管\"",
    pos: "名词", tags: "完井,固井", version: 1,
    createdAt: "2024-01-18T08:00:00Z", updatedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: 5, dbId: 1, cnTerm: "抽油机", ruTerm: "станок-качалка", enTerm: "pumping unit",
    definition: "有杆采油用的地面动力设备，通过往复运动带动抽油杆",
    context: "采油现场：\"调整抽油机冲程和冲次\"",
    cultureNote: "качалка来自качать（摇摆），形象描述上下运动",
    pos: "名词", tags: "采油,地面设备", version: 1,
    createdAt: "2024-01-19T08:00:00Z", updatedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: 6, dbId: 1, cnTerm: "井口装置", ruTerm: "устьевая арматура", enTerm: "wellhead equipment",
    definition: "安装在井口用于控制油气生产的成套设备，包括套管头、油管头、采油树",
    context: "修井作业：\"关闭井口装置，准备压井\"",
    cultureNote: "устье指河口、井口，арматура原意为配件、管件",
    pos: "名词", tags: "井口,采油", version: 1,
    createdAt: "2024-01-20T08:00:00Z", updatedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: 7, dbId: 1, cnTerm: "压裂", ruTerm: "гидроразрыв пласта", enTerm: "hydraulic fracturing",
    definition: "利用高压液体在储层中造缝以提高油气渗透率的增产措施",
    context: "增产措施：\"对低渗透储层进行水力压裂\"",
    cultureNote: "俄语中常用缩写ГРП（гидроразрыв пласта）",
    pos: "名词", tags: "增产,井下作业", version: 1,
    createdAt: "2024-01-21T08:00:00Z", updatedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: 8, dbId: 1, cnTerm: "测井", ruTerm: "каротаж", enTerm: "well logging",
    definition: "利用各种物理方法测量井下地层物理参数的技术",
    context: "完井阶段：\"进行电法测井和声波测井\"",
    cultureNote: "каротаж来自法语carottage，是国际通用术语",
    pos: "名词", tags: "测井,勘探", version: 1,
    createdAt: "2024-01-22T08:00:00Z", updatedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: 9, dbId: 1, cnTerm: "固井", ruTerm: "цементирование скважины", enTerm: "cementing",
    definition: "将套管固定在井壁与套管环空内注入水泥浆的作业",
    context: "钻井工序：\"表层套管固井质量检验合格\"",
    cultureNote: "цементирование来自цемент（水泥），俄语中也说цементация",
    pos: "名词", tags: "固井,完井", version: 1,
    createdAt: "2024-01-23T08:00:00Z", updatedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: 10, dbId: 1, cnTerm: "钻井液", ruTerm: "буровой раствор", enTerm: "drilling fluid",
    definition: "钻井过程中用于冷却钻头、携带岩屑、稳定井壁的循环工作液",
    context: "泥浆工报告：\"钻井液密度1.25g/cm³，黏度正常\"",
    cultureNote: "口语中也叫буровой раствор，国际通用mud",
    pos: "名词", tags: "钻井,泥浆", version: 1,
    createdAt: "2024-01-24T08:00:00Z", updatedAt: "2024-06-01T10:30:00Z",
  },
  // 电力设备 - 8条
  {
    id: 11, dbId: 2, cnTerm: "汽轮机", ruTerm: "паровая турбина", enTerm: "steam turbine",
    definition: "利用蒸汽膨胀做功驱动发电机旋转的原动机",
    context: "火电厂：\"汽轮机额定功率600MW\"",
    cultureNote: "турбина是国际通用词，源自拉丁语turbo（旋转）",
    pos: "名词", tags: "发电,火电", version: 1,
    createdAt: "2024-02-01T09:00:00Z", updatedAt: "2024-06-05T14:20:00Z",
  },
  {
    id: 12, dbId: 2, cnTerm: "发电机", ruTerm: "электрогенератор", enTerm: "generator",
    definition: "将机械能转换为电能的旋转电机设备",
    context: "机组运行：\"发电机出口电压20kV\"",
    cultureNote: "也可说генератор，электрогенератор更正式",
    pos: "名词", tags: "发电,电机", version: 1,
    createdAt: "2024-02-02T09:00:00Z", updatedAt: "2024-06-05T14:20:00Z",
  },
  {
    id: 13, dbId: 2, cnTerm: "变压器", ruTerm: "трансформатор", enTerm: "transformer",
    definition: "利用电磁感应原理改变交流电压的静止电气设备",
    context: "变电站：\"主变压器容量1000MVA\"",
    cultureNote: "来自拉丁语transformare（变换），国际通用术语",
    pos: "名词", tags: "变电,输配电", version: 1,
    createdAt: "2024-02-03T09:00:00Z", updatedAt: "2024-06-05T14:20:00Z",
  },
  {
    id: 14, dbId: 2, cnTerm: "高压开关", ruTerm: "высоковольтный выключатель", enTerm: "high-voltage circuit breaker",
    definition: "额定电压3kV及以上用于关合和开断电路的开关设备",
    context: "配电系统：\"检查110kV高压开关动作特性\"",
    cultureNote: "выключатель为通用开关，加высоковольтный限定高压",
    pos: "名词", tags: "配电,开关设备", version: 1,
    createdAt: "2024-02-04T09:00:00Z", updatedAt: "2024-06-05T14:20:00Z",
  },
  {
    id: 15, dbId: 2, cnTerm: "水轮机", ruTerm: "гидротурбина", enTerm: "hydraulic turbine",
    definition: "利用水流能量驱动旋转的水力机械",
    context: "水电站：\"混流式水轮机效率92%\"",
    cultureNote: "гидро-为水的词头，与гидроэнергетика（水电）同源",
    pos: "名词", tags: "水电,发电", version: 1,
    createdAt: "2024-02-05T09:00:00Z", updatedAt: "2024-06-05T14:20:00Z",
  },
  {
    id: 16, dbId: 2, cnTerm: "反应堆", ruTerm: "ядерный реактор", enTerm: "nuclear reactor",
    definition: "核电站中实现可控核裂变链式反应的装置",
    context: "核电站：\"反应堆热功率3000MW\"",
    cultureNote: "реактор来自英语reactor，国际通用",
    pos: "名词", tags: "核电,核岛", version: 1,
    createdAt: "2024-02-06T09:00:00Z", updatedAt: "2024-06-05T14:20:00Z",
  },
  {
    id: 17, dbId: 2, cnTerm: "输电线路", ruTerm: "линия электропередачи", enTerm: "transmission line",
    definition: "用于输送电能的架空线路或电缆线路",
    context: "电网建设：\"新建500kV输电线路120公里\"",
    cultureNote: "常缩写为ЛЭП，是俄语电力领域高频词",
    pos: "名词", tags: "输电,电网", version: 1,
    createdAt: "2024-02-07T09:00:00Z", updatedAt: "2024-06-05T14:20:00Z",
  },
  {
    id: 18, dbId: 2, cnTerm: "断路器", ru_term: "автоматический выключатель", enTerm: "circuit breaker",
    definition: "能够关合、承载和开断正常回路电流的开关装置",
    context: "继电保护：\"断路器失灵保护动作\"",
    cultureNote: "口语中也说автомат",
    pos: "名词", tags: "配电,保护", version: 1,
    createdAt: "2024-02-08T09:00:00Z", updatedAt: "2024-06-05T14:20:00Z",
  },
  // 新能源装备 - 6条
  {
    id: 19, dbId: 3, cnTerm: "风力发电机", ruTerm: "ветрогенератор", enTerm: "wind turbine generator",
    definition: "将风能转化为电能的装置，由叶片、齿轮箱、发电机等组成",
    context: "风电场：\"风力发电机单机容量3MW\"",
    cultureNote: "ветро-为风的词头，同ветроэнергетика（风能）",
    pos: "名词", tags: "风电,发电", version: 1,
    createdAt: "2024-02-20T10:00:00Z", updatedAt: "2024-06-08T16:45:00Z",
  },
  {
    id: 20, dbId: 3, cnTerm: "光伏组件", ruTerm: "фотомодуль", enTerm: "photovoltaic module",
    definition: "由太阳能电池片封装而成的发电单元",
    context: "光伏电站：\"光伏组件转换效率21%\"",
    cultureNote: "фото-来自希腊语phos（光），俄语中常用",
    pos: "名词", tags: "光伏,太阳能", version: 1,
    createdAt: "2024-02-21T10:00:00Z", updatedAt: "2024-06-08T16:45:00Z",
  },
  {
    id: 21, dbId: 3, cnTerm: "逆变器", ruTerm: "инвертор", enTerm: "inverter",
    definition: "将直流电转换为交流电的电力电子装置",
    context: "光伏系统：\"逆变器最大功率跟踪效率99%\"",
    cultureNote: "来自英语inverter，国际通用术语",
    pos: "名词", tags: "光伏,电力电子", version: 1,
    createdAt: "2024-02-22T10:00:00Z", updatedAt: "2024-06-08T16:45:00Z",
  },
  {
    id: 22, dbId: 3, cnTerm: "电解槽", ruTerm: "электролизёр", enTerm: "electrolyzer",
    definition: "利用电解原理制取氢气的装置",
    context: "氢能产业：\"碱性电解槽能耗4.5kWh/Nm³\"",
    cultureNote: "электролизёр来自электролиз（电解），是俄语新造词",
    pos: "名词", tags: "氢能,电解", version: 1,
    createdAt: "2024-02-23T10:00:00Z", updatedAt: "2024-06-08T16:45:00Z",
  },
  {
    id: 23, dbId: 3, cnTerm: "储能电池", ruTerm: "аккумуляторная батарея", enTerm: "storage battery",
    definition: "用于储存电能的蓄电池系统",
    context: "储能电站：\"磷酸铁锂电池储能系统容量100MWh\"",
    cultureNote: "口语中常说аккумулятор，正式场合用全称",
    pos: "名词", tags: "储能,电池", version: 1,
    createdAt: "2024-02-24T10:00:00Z", updatedAt: "2024-06-08T16:45:00Z",
  },
  {
    id: 24, dbId: 3, cnTerm: "叶片", ruTerm: "лопасть", enTerm: "blade",
    definition: "风力发电机组中捕获风能的旋转部件",
    context: "风机制造：\"叶片长度80米，碳纤维复合材料\"",
    cultureNote: "лопасть也指螺旋桨叶片，风力领域专用",
    pos: "名词", tags: "风电,部件", version: 1,
    createdAt: "2024-02-25T10:00:00Z", updatedAt: "2024-06-08T16:45:00Z",
  },
  // 煤炭机械 - 5条
  {
    id: 25, dbId: 4, cnTerm: "采煤机", ruTerm: "очистной комбайн", enTerm: "coal shearer",
    definition: "机械化采煤工作面的核心设备，用于破煤和装煤",
    context: "综采工作面：\"采煤机截割功率800kW\"",
    cultureNote: "комбайн原意为联合收割机，矿山中借指采煤机",
    pos: "名词", tags: "采煤,综采", version: 1,
    createdAt: "2024-03-01T11:00:00Z", updatedAt: "2024-06-03T09:15:00Z",
  },
  {
    id: 26, dbId: 4, cnTerm: "液压支架", ruTerm: "гидравлическая крепь", enTerm: "hydraulic support",
    definition: "综采工作面用于支护顶板的液压设备",
    context: "工作面支护：\"液压支架工作阻力8000kN\"",
    cultureNote: "крепь原意为加固、支撑，矿山专用术语",
    pos: "名词", tags: "支护,综采", version: 1,
    createdAt: "2024-03-02T11:00:00Z", updatedAt: "2024-06-03T09:15:00Z",
  },
  {
    id: 27, dbId: 4, cnTerm: "掘进机", ruTerm: "проходческий комбайн", enTerm: "roadheader",
    definition: "用于巷道掘进的机械，具有截割、装运功能",
    context: "巷道掘进：\"掘进机截割头直径1.2米\"",
    cultureNote: "проходка指巷道掘进，проходческий为形容词形式",
    pos: "名词", tags: "掘进,巷道", version: 1,
    createdAt: "2024-03-03T11:00:00Z", updatedAt: "2024-06-03T09:15:00Z",
  },
  {
    id: 28, dbId: 4, cnTerm: "刮板输送机", ruTerm: "скребковый конвейер", enTerm: "scraper conveyor",
    definition: "用刮板链牵引在槽内运送煤炭的连续运输设备",
    context: "工作面运输：\"刮板输送机运量800t/h\"",
    cultureNote: "скребок原意为刮刀，скребковый为形容词",
    pos: "名词", tags: "运输,综采", version: 1,
    createdAt: "2024-03-04T11:00:00Z", updatedAt: "2024-06-03T09:15:00Z",
  },
  {
    id: 29, dbId: 4, cnTerm: "矿井通风机", ruTerm: "рудничный вентилятор", enTerm: "mine ventilation fan",
    definition: "为井下提供新鲜空气、排出有害气体的通风设备",
    context: "通风系统：\"主通风机风量8000m³/min\"",
    cultureNote: "рудничный来自рудник（矿山），强调矿井环境",
    pos: "名词", tags: "通风,安全", version: 1,
    createdAt: "2024-03-05T11:00:00Z", updatedAt: "2024-06-03T09:15:00Z",
  },
  // 管道与储运 - 5条
  {
    id: 30, dbId: 5, cnTerm: "输油管道", ruTerm: "нефтепровод", enTerm: "oil pipeline",
    definition: "用于输送原油或成品管的钢制管道系统",
    context: "管道工程：\"输油管道直径1000mm，设计压力10MPa\"",
    cultureNote: "нефтепровод为нефть（石油）+ провод（管道）的合成词",
    pos: "名词", tags: "管道,原油", version: 1,
    createdAt: "2024-03-10T12:00:00Z", updatedAt: "2024-06-10T11:00:00Z",
  },
  {
    id: 31, dbId: 5, cnTerm: "储油罐", ruTerm: "резервуар для нефти", enTerm: "oil storage tank",
    definition: "用于储存原油的大型立式圆筒形金属容器",
    context: "油库：\"浮顶储油罐容积50000m³\"",
    cultureNote: "резервуар为通用容器词，加для нефти限定用途",
    pos: "名词", tags: "储运,油库", version: 1,
    createdAt: "2024-03-11T12:00:00Z", updatedAt: "2024-06-10T11:00:00Z",
  },
  {
    id: 32, dbId: 5, cnTerm: "压缩机", ruTerm: "компрессор", enTerm: "compressor",
    definition: "对气体进行压缩提高压力的机械设备",
    context: "天然气输送：\"离心式压缩机出口压力10MPa\"",
    cultureNote: "来自拉丁语compressor，国际通用",
    pos: "名词", tags: "天然气,压缩", version: 1,
    createdAt: "2024-03-12T12:00:00Z", updatedAt: "2024-06-10T11:00:00Z",
  },
  {
    id: 33, dbId: 5, cnTerm: "LNG接收站", ruTerm: "СПГ-терминал", enTerm: "LNG receiving terminal",
    definition: "接收、储存和气化液化天然气的海岸设施",
    context: "天然气进口：\"LNG接收站年接卸能力600万吨\"",
    cultureNote: "СПГ（сжиженный природный газ）为俄语LNG缩写",
    pos: "缩写", tags: "LNG,天然气", version: 1,
    createdAt: "2024-03-13T12:00:00Z", updatedAt: "2024-06-10T11:00:00Z",
  },
  {
    id: 34, dbId: 5, cnTerm: "清管器", ruTerm: "счётчик-трубоочиститель", enTerm: "pig",
    definition: "在管道内运行用于清管、检测的装置",
    context: "管道维护：\"发送清管器进行管道内检测\"",
    cultureNote: "英语pig源于装置在管道内运行的 squeal 声",
    pos: "名词", tags: "管道,维护", version: 1,
    createdAt: "2024-03-14T12:00:00Z", updatedAt: "2024-06-10T11:00:00Z",
  },
];

// Quiz questions mock data
export const mockQuizQuestions: MockQuizQuestion[] = [
  {
    id: 1,
    question: "'钻机'的俄文翻译是？",
    options: ["буровой станок", "буровое долото", "бурильная труба", "обсадная труба"],
    correctAnswer: "буровой станок",
  },
  {
    id: 2,
    question: "'паровая турбина'的中文意思是？",
    options: ["汽轮机", "发电机", "变压器", "水轮机"],
    correctAnswer: "汽轮机",
  },
  {
    id: 3,
    question: "'风力发电机'的俄文翻译是？",
    options: ["ветрогенератор", "гидротурбина", "фотомодуль", "электролизёр"],
    correctAnswer: "ветрогенератор",
  },
  {
    id: 4,
    question: "'гидроразрыв пласта'的中文意思是？",
    options: ["压裂", "固井", "测井", "钻井"],
    correctAnswer: "压裂",
  },
  {
    id: 5,
    question: "'输油管道'的俄文翻译是？",
    options: ["нефтепровод", "газопровод", "нефтехранилище", "компрессорная станция"],
    correctAnswer: "нефтепровод",
  },
  {
    id: 6,
    question: "'электрогенератор'的中文意思是？",
    options: ["发电机", "电动机", "变压器", "断路器"],
    correctAnswer: "发电机",
  },
  {
    id: 7,
    question: "'采煤机'的俄文翻译是？",
    options: ["очистной комбайн", "проходческий комбайн", "скребковый конвейер", "гидравлическая крепь"],
    correctAnswer: "очистной комбайн",
  },
  {
    id: 8,
    question: "'фотомодуль'的中文意思是？",
    options: ["光伏组件", "风力发电机", "储能电池", "逆变器"],
    correctAnswer: "光伏组件",
  },
  {
    id: 9,
    question: "'套管'的俄文翻译是？",
    options: ["обсадная труба", "бурильная труба", "насосно-компрессорная труба", "колонковая труба"],
    correctAnswer: "обсадная труба",
  },
  {
    id: 10,
    question: "'ветрогенератор'的英文翻译是？",
    options: ["wind turbine generator", "solar panel", "hydro turbine", "gas turbine"],
    correctAnswer: "wind turbine generator",
  },
];

// Helper functions
export function getTermsByDbId(dbId: number): MockTerm[] {
  return mockTerms.filter((t) => t.dbId === dbId);
}

export function getTermById(id: number): MockTerm | undefined {
  return mockTerms.find((t) => t.id === id);
}

export function getDbById(id: number): MockDatabase | undefined {
  return mockDatabases.find((d) => d.id === id);
}

export function searchTerms(params: { dbId?: number; search?: string; pos?: string }): MockTerm[] {
  let result = mockTerms;
  if (params.dbId) {
    result = result.filter((t) => t.dbId === params.dbId);
  }
  if (params.search) {
    const s = params.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.cnTerm.toLowerCase().includes(s) ||
        t.ruTerm.toLowerCase().includes(s) ||
        (t.enTerm && t.enTerm.toLowerCase().includes(s))
    );
  }
  if (params.pos) {
    result = result.filter((t) => t.pos === params.pos);
  }
  return result;
}

export function getMockStats() {
  return {
    totalTerms: mockTerms.length,
    totalDatabases: mockDatabases.length,
  };
}
