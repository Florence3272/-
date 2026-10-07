import { getDb } from "../api/queries/connection";
import { databases, terms, resources } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const db = getDb();

  // Seed databases
  const dbData = [
    { name: "油气开采装备", category: "油气领域", description: "涵盖石油天然气勘探、钻井、采油、集输等全产业链装备术语", ownerId: 1, termCount: 0 },
    { name: "电力输变电设备", category: "电力领域", description: "涵盖发电、输电、变电、配电等电力系统设备术语", ownerId: 1, termCount: 0 },
    { name: "新能源装备", category: "新能源领域", description: "涵盖风电、光伏、储能、氢能等新能源装备术语", ownerId: 1, termCount: 0 },
    { name: "煤化工装备", category: "化工领域", description: "涵盖煤制油、煤制气、煤制烯烃等煤化工装备术语", ownerId: 1, termCount: 0 },
    { name: "核电装备", category: "核能领域", description: "涵盖核岛设备、常规岛设备、核燃料循环等核电装备术语", ownerId: 1, termCount: 0 },
  ];

  const insertedDbs = await db.insert(databases).values(dbData).$returningId();
  console.log("Inserted databases:", insertedDbs);

  // Seed terms for each database
  const termsData = [
    // 油气开采装备
    { dbId: insertedDbs[0].id, cnTerm: "钻井平台", ruTerm: "буровая платформа", enTerm: "drilling platform", definition: "用于海上或陆地油气钻井作业的大型成套设备", context: "海上油气田开发", pos: "名词", tags: "海洋,钻井" },
    { dbId: insertedDbs[0].id, cnTerm: "抽油机", ruTerm: "качалка", enTerm: "pumping unit", definition: "有杆抽油系统的地面驱动设备", context: "陆上油田生产", pos: "名词", tags: "采油,机械" },
    { dbId: insertedDbs[0].id, cnTerm: "油气分离器", ruTerm: "сепаратор нефти и газа", enTerm: "oil-gas separator", definition: "将井口产出的油气混合物分离为原油、天然气和采出水的设备", context: "油气集输处理", pos: "名词", tags: "集输,分离" },
    { dbId: insertedDbs[0].id, cnTerm: "压裂车", ruTerm: "агрегат для гидроразрыва", enTerm: "fracturing truck", definition: "用于水力压裂作业的高压泵送设备", context: "储层改造", pos: "名词", tags: "压裂,设备" },
    { dbId: insertedDbs[0].id, cnTerm: "套管", ruTerm: "обсадная колонна", enTerm: "casing", definition: "下入井内用于加固井壁、封隔地层的钢管", context: "钻井完井", pos: "名词", tags: "钻井,管材" },
    { dbId: insertedDbs[0].id, cnTerm: "钻头", ruTerm: "долото", enTerm: "drill bit", definition: "钻井过程中破碎岩石的工具", context: "钻井作业", pos: "名词", tags: "钻井,工具" },
    { dbId: insertedDbs[0].id, cnTerm: "采油树", ruTerm: "фонтанная арматура", enTerm: "christmas tree", definition: "安装在井口用于控制油气生产的装置", context: "采油生产", pos: "名词", tags: "采油,井口" },
    { dbId: insertedDbs[0].id, cnTerm: "输油管道", ruTerm: "нефтепровод", enTerm: "oil pipeline", definition: "输送原油的管道系统", context: "油气储运", pos: "名词", tags: "管道,运输" },

    // 电力输变电设备
    { dbId: insertedDbs[1].id, cnTerm: "汽轮发电机", ruTerm: "турбогенератор", enTerm: "turbo generator", definition: "由汽轮机驱动的交流发电机", context: "火力发电厂", pos: "名词", tags: "发电,旋转设备" },
    { dbId: insertedDbs[1].id, cnTerm: "变压器", ruTerm: "трансформатор", enTerm: "transformer", definition: "利用电磁感应原理改变交流电压的电气设备", context: "输变电系统", pos: "名词", tags: "变电,电磁" },
    { dbId: insertedDbs[1].id, cnTerm: "断路器", ruTerm: "выключатель", enTerm: "circuit breaker", definition: "能在正常和故障条件下接通和断开电路的开关设备", context: "输配电系统", pos: "名词", tags: "开关,保护" },
    { dbId: insertedDbs[1].id, cnTerm: "输电线路", ruTerm: "линия электропередачи", enTerm: "transmission line", definition: "输送电能的架空线路或电缆线路", context: "输电网络", pos: "名词", tags: "输电,线路" },
    { dbId: insertedDbs[1].id, cnTerm: "隔离开关", ruTerm: "разъединитель", enTerm: "disconnector", definition: "用于在设备检修时形成明显断开点的开关", context: "变电站", pos: "名词", tags: "开关,安全" },
    { dbId: insertedDbs[1].id, cnTerm: "避雷器", ruTerm: "разрядник", enTerm: "surge arrester", definition: "保护电气设备免受过电压损害的装置", context: "过电压保护", pos: "名词", tags: "保护,防雷" },
    { dbId: insertedDbs[1].id, cnTerm: "电抗器", ruTerm: "реактор", enTerm: "reactor", definition: "利用电感效应限制短路电流或补偿无功功率的设备", context: "输变电系统", pos: "名词", tags: "变电,无功" },
    { dbId: insertedDbs[1].id, cnTerm: "变电站", ruTerm: "подстанция", enTerm: "substation", definition: "变换电压、汇集和分配电能的场所", context: "电网建设", pos: "名词", tags: "变电,基础设施" },

    // 新能源装备
    { dbId: insertedDbs[2].id, cnTerm: "风力发电机组", ruTerm: "ветрогенератор", enTerm: "wind turbine generator", definition: "将风能转换为电能的成套设备", context: "风电场", pos: "名词", tags: "风电,发电" },
    { dbId: insertedDbs[2].id, cnTerm: "光伏组件", ruTerm: "фотоэлектрический модуль", enTerm: "photovoltaic module", definition: "将太阳能转换为直流电的半导体器件组合", context: "光伏电站", pos: "名词", tags: "光伏,太阳能" },
    { dbId: insertedDbs[2].id, cnTerm: "储能电池", ruTerm: "аккумуляторная батарея", enTerm: "storage battery", definition: "用于存储电能的电池系统", context: "储能电站", pos: "名词", tags: "储能,电池" },
    { dbId: insertedDbs[2].id, cnTerm: "逆变器", ruTerm: "инвертор", enTerm: "inverter", definition: "将直流电转换为交流电的电力电子装置", context: "光伏发电", pos: "名词", tags: "电力电子,转换" },
    { dbId: insertedDbs[2].id, cnTerm: "叶片", ruTerm: "лопасть", enTerm: "blade", definition: "风力机捕获风能的旋转部件", context: "风力发电", pos: "名词", tags: "风电,结构件" },
    { dbId: insertedDbs[2].id, cnTerm: "塔筒", ruTerm: "башня", enTerm: "tower", definition: "支撑风力发电机组的塔架结构", context: "风力发电", pos: "名词", tags: "风电,支撑结构" },
    { dbId: insertedDbs[2].id, cnTerm: "充电桩", ruTerm: "зарядная станция", enTerm: "charging pile", definition: "为电动汽车提供电能补给的设备", context: "电动汽车", pos: "名词", tags: "充电,基础设施" },
    { dbId: insertedDbs[2].id, cnTerm: "电解槽", ruTerm: "электролизер", enTerm: "electrolyzer", definition: "利用电解水制取氢气的装置", context: "氢能产业", pos: "名词", tags: "氢能,电解" },

    // 煤化工装备
    { dbId: insertedDbs[3].id, cnTerm: "气化炉", ruTerm: "газификатор", enTerm: "gasifier", definition: "将煤炭转化为合成气的核心反应设备", context: "煤气化", pos: "名词", tags: "气化,反应器" },
    { dbId: insertedDbs[3].id, cnTerm: "变换炉", ruTerm: "конвертор", enTerm: "shift converter", definition: "将合成气中的一氧化碳转化为氢气和二氧化碳的设备", context: "合成气变换", pos: "名词", tags: "变换,催化" },
    { dbId: insertedDbs[3].id, cnTerm: "合成塔", ruTerm: "синтез-реактор", enTerm: "synthesis reactor", definition: "进行费托合成或甲醇合成等反应的压力容器", context: "合成反应", pos: "名词", tags: "合成,压力容器" },
    { dbId: insertedDbs[3].id, cnTerm: "空分装置", ruTerm: "воздухоразделительная установка", enTerm: "air separation unit", definition: "将空气分离为氧气、氮气等产品的装置", context: "煤化工配套", pos: "名词", tags: "空分,气体" },

    // 核电装备
    { dbId: insertedDbs[4].id, cnTerm: "反应堆压力容器", ruTerm: "корпус реактора", enTerm: "reactor pressure vessel", definition: "包容核燃料和冷却剂的高压容器", context: "核电站核岛", pos: "名词", tags: "核岛,压力容器" },
    { dbId: insertedDbs[4].id, cnTerm: "蒸汽发生器", ruTerm: "парогенератор", enTerm: "steam generator", definition: "将一回路冷却剂的热量传递给二回路水产生蒸汽的热交换器", context: "核电站核岛", pos: "名词", tags: "核岛,热交换" },
    { dbId: insertedDbs[4].id, cnTerm: "控制棒", ruTerm: "орган управления", enTerm: "control rod", definition: "用于控制核反应堆反应速度的棒状组件", context: "反应堆控制", pos: "名词", tags: "核控制,中子吸收" },
    { dbId: insertedDbs[4].id, cnTerm: "安全壳", ruTerm: "защитная оболочка", enTerm: "containment", definition: "防止放射性物质外泄的密封建筑结构", context: "核电站安全", pos: "名词", tags: "核安全,建筑" },
  ];

  await db.insert(terms).values(termsData);
  console.log(`Inserted ${termsData.length} terms`);

  // Update term counts
  for (const dbItem of insertedDbs) {
    const count = termsData.filter((t) => t.dbId === dbItem.id).length;
    await db.update(databases).set({ termCount: count }).where(eq(databases.id, dbItem.id));
  }

  // Seed resources
  const resourcesData = [
    { dbId: insertedDbs[0].id, moduleType: "dialogue" as const, title: "油气设备招标谈判", content: "场景：中方企业向俄方供应商采购钻井设备...\n\n中方：我们对贵公司的 drilling platform 很感兴趣。\n俄方：我们的钻井平台符合所有国际安全标准。\n中方：能否提供详细的技术参数和报价？\n俄方：当然，我们可以安排技术团队进行详细交流。", difficulty: "intermediate" as const, duration: 15 },
    { dbId: insertedDbs[0].id, moduleType: "reading" as const, title: "俄罗斯油气装备市场分析", content: "俄罗斯是全球最大的石油生产国之一，其油气装备市场规模庞大...", difficulty: "advanced" as const, duration: 20 },
    { dbId: insertedDbs[0].id, moduleType: "quiz" as const, title: "油气装备术语测试", content: "测试您对油气装备术语的掌握程度", difficulty: "intermediate" as const, duration: 10 },
    { dbId: insertedDbs[0].id, moduleType: "culture" as const, title: "俄罗斯商务谈判文化", content: "俄罗斯商务文化特点：重视人际关系、决策周期较长、注重合同的法律效力...", difficulty: "beginner" as const, duration: 10 },
    { dbId: insertedDbs[1].id, moduleType: "dialogue" as const, title: "电力设备出口洽谈", content: "场景：中方向俄方出口变压器设备...", difficulty: "intermediate" as const, duration: 15 },
    { dbId: insertedDbs[1].id, moduleType: "case" as const, title: "中俄电力合作项目案例", content: "分析中俄跨境电力合作的典型案例...", difficulty: "advanced" as const, duration: 25 },
    { dbId: insertedDbs[2].id, moduleType: "reading" as const, title: "俄罗斯可再生能源政策", content: "俄罗斯政府近年来加大了对可再生能源的支持力度...", difficulty: "intermediate" as const, duration: 15 },
    { dbId: insertedDbs[2].id, moduleType: "culture" as const, title: "中俄新能源合作机遇", content: "随着全球能源转型，中俄在新能源领域的合作前景广阔...", difficulty: "beginner" as const, duration: 10 },
  ];

  await db.insert(resources).values(resourcesData);
  console.log(`Inserted ${resourcesData.length} resources`);

  console.log("Seed completed!");
}

seed().catch(console.error);
