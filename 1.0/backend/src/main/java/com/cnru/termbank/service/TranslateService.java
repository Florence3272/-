package com.cnru.termbank.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cnru.termbank.entity.Term;
import com.cnru.termbank.mapper.TermMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 中俄术语翻译引擎：术语库标准译法优先，其次内置词典。
 * 生产环境可替换为大模型/第三方翻译 API（返回结构保持不变）。
 */
@Service
public class TranslateService {

    public static final Map<String, String> ZH_RU = new LinkedHashMap<>();
    public static final Map<String, String> RU_ZH = new LinkedHashMap<>();

    static {
        ZH_RU.put("石油", "нефть");
        ZH_RU.put("天然气", "природный газ");
        ZH_RU.put("煤炭", "уголь");
        ZH_RU.put("电力", "электроэнергия");
        ZH_RU.put("能源", "энергия");
        ZH_RU.put("装备", "оборудование");
        ZH_RU.put("设备", "оборудование");
        ZH_RU.put("开采", "добыча");
        ZH_RU.put("管道", "трубопровод");
        ZH_RU.put("阀门", "клапан");
        ZH_RU.put("泵", "насос");
        ZH_RU.put("压缩机", "компрессор");
        ZH_RU.put("发电机", "генератор");
        ZH_RU.put("变压器", "трансформатор");
        ZH_RU.put("钻井", "бурение");
        ZH_RU.put("炼油", "нефтепереработка");
        ZH_RU.put("化工", "химическая промышленность");
        ZH_RU.put("新能源", "возобновляемая энергия");
        ZH_RU.put("太阳能", "солнечная энергия");
        ZH_RU.put("风能", "ветровая энергия");
        ZH_RU.put("核能", "ядерная энергия");
        ZH_RU.put("合同", "контракт");
        ZH_RU.put("招标", "тендер");
        ZH_RU.put("谈判", "переговоры");
        ZH_RU.put("出口", "экспорт");
        ZH_RU.put("进口", "импорт");
        ZH_RU.put("价格", "цена");
        ZH_RU.put("质量", "качество");
        ZH_RU.put("标准", "стандарт");
        ZH_RU.put("技术", "технология");
        ZH_RU.put("安装", "установка");
        ZH_RU.put("维护", "обслуживание");
        ZH_RU.put("安全", "безопасность");
        ZH_RU.put("环保", "охрана окружающей среды");
        ZH_RU.put("项目", "проект");
        ZH_RU.put("投资", "инвестиция");
        ZH_RU.put("市场", "рынок");
        ZH_RU.put("公司", "компания");
        ZH_RU.put("协议", "соглашение");
        for (Map.Entry<String, String> e : ZH_RU.entrySet()) {
            RU_ZH.put(e.getValue(), e.getKey());
        }
    }

    private final TermMapper termMapper;

    public TranslateService(TermMapper termMapper) {
        this.termMapper = termMapper;
    }

    public static class Matched {
        public String cn;
        public String ru;
        public String source;
        public Long id;
        public Long dbId;

        public Matched(String cn, String ru, String source) {
            this.cn = cn;
            this.ru = ru;
            this.source = source;
        }
    }

    public static class TranslateResult {
        public String result;
        public List<Matched> matchedTerms;
        public boolean isMachineTranslated;
    }

    public TranslateResult translate(String text, String sourceLang) {
        boolean zh = !"ru".equals(sourceLang);

        List<Matched> matched = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();

        for (Term t : termMapper.matchInText(text)) {
            String key = zh ? t.getCnTerm() : t.getRuTerm();
            if (key == null || !seen.add(key)) continue;
            Matched m = new Matched(t.getCnTerm(), t.getRuTerm(), "termbank");
            m.id = t.getId();
            m.dbId = t.getDbId();
            matched.add(m);
        }

        Map<String, String> dict = zh ? ZH_RU : RU_ZH;
        for (Map.Entry<String, String> e : dict.entrySet()) {
            if (text.contains(e.getKey())) {
                String key = zh ? e.getKey() : e.getValue();
                if (!seen.add(key)) continue;
                matched.add(zh
                        ? new Matched(e.getKey(), e.getValue(), "dict")
                        : new Matched(e.getValue(), e.getKey(), "dict"));
            }
        }

        String result = text;
        for (Matched m : matched) {
            result = zh ? result.replace(m.cn, m.ru) : result.replace(m.ru, m.cn);
        }

        TranslateResult r = new TranslateResult();
        r.result = result;
        r.matchedTerms = matched;
        r.isMachineTranslated = matched.isEmpty() || !result.equals(text);
        return r;
    }

    /** 快速查词：术语库 → 词典 */
    public Map<String, Object> quickLookup(String q) {
        List<Term> terms = termMapper.selectList(new QueryWrapper<Term>()
                .eq("status", "active")
                .and(w -> w.like("cnTerm", q).or().like("ruTerm", q).or().like("enTerm", q))
                .last("LIMIT 5"));

        Map<String, Object> out = new LinkedHashMap<>();
        if (!terms.isEmpty()) {
            out.put("found", true);
            out.put("source", "termbank");
            out.put("terms", terms);
            return out;
        }

        String direct = ZH_RU.get(q) != null ? ZH_RU.get(q) : RU_ZH.get(q);
        if (direct != null) {
            boolean isZh = ZH_RU.containsKey(q);
            Map<String, Object> t = new LinkedHashMap<>();
            t.put("id", 0);
            t.put("dbId", 0);
            t.put("cnTerm", isZh ? q : direct);
            t.put("ruTerm", isZh ? direct : q);
            t.put("enTerm", null);
            t.put("definition", null);
            out.put("found", true);
            out.put("source", "dict");
            out.put("terms", java.util.Collections.singletonList(t));
            return out;
        }

        out.put("found", false);
        out.put("source", "none");
        out.put("terms", java.util.Collections.emptyList());
        return out;
    }
}
