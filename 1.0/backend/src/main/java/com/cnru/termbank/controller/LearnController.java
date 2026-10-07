package com.cnru.termbank.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cnru.termbank.common.ApiException;
import com.cnru.termbank.common.Result;
import com.cnru.termbank.dto.Requests;
import com.cnru.termbank.entity.*;
import com.cnru.termbank.mapper.*;
import com.cnru.termbank.security.UserContext;
import com.cnru.termbank.service.AccessService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/learn")
public class LearnController {

    private static final List<String> QUIZ_MODES =
            java.util.Arrays.asList("zh_to_ru", "ru_to_zh", "fill_blank", "match", "definition");

    private final TermMapper termMapper;
    private final ResourceMapper resourceMapper;
    private final LearningRecordMapper recordMapper;
    private final LearningPathMapper pathMapper;
    private final LearningPathNodeMapper pathNodeMapper;
    private final AccessService accessService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public LearnController(TermMapper termMapper, ResourceMapper resourceMapper, LearningRecordMapper recordMapper,
                           LearningPathMapper pathMapper, LearningPathNodeMapper pathNodeMapper,
                           AccessService accessService) {
        this.termMapper = termMapper;
        this.resourceMapper = resourceMapper;
        this.recordMapper = recordMapper;
        this.pathMapper = pathMapper;
        this.pathNodeMapper = pathNodeMapper;
        this.accessService = accessService;
    }

    private List<Term> randomTerms(Long dbId, int n) {
        QueryWrapper<Term> w = new QueryWrapper<>();
        w.eq("status", "active");
        if (dbId != null) w.eq("dbId", dbId);
        w.last("ORDER BY RAND() LIMIT " + Math.max(1, n));
        return termMapper.selectList(w);
    }

    // ---------------- 闪卡 ----------------
    @GetMapping("/flashcards")
    public Result<List<Term>> flashcards(@RequestParam(required = false) Long dbId,
                                         @RequestParam(defaultValue = "20") Integer limit) {
        return Result.ok(randomTerms(dbId, limit));
    }

    // ---------------- 测试题 ----------------
    @GetMapping("/quiz")
    public Result<List<Map<String, Object>>> quiz(@RequestParam(required = false) Long dbId,
                                                  @RequestParam(defaultValue = "zh_to_ru") String mode,
                                                  @RequestParam(defaultValue = "10") Integer limit) {
        if (!QUIZ_MODES.contains(mode)) throw ApiException.badRequest("不支持的题型");
        List<Term> pool = randomTerms(dbId, limit * 4);
        if (pool.isEmpty()) return Result.ok(Collections.emptyList());

        List<Map<String, Object>> questions = new ArrayList<>();
        for (int i = 0; i < Math.min(limit, pool.size()); i++) {
            Term term = pool.get(i);
            List<Term> distractors = new ArrayList<>();
            for (int j = 0; j < pool.size() && distractors.size() < 3; j++) {
                if (j != i) distractors.add(pool.get(j));
            }
            Map<String, Object> q = new LinkedHashMap<>();
            q.put("id", term.getId());
            q.put("dbId", term.getDbId());
            q.put("mode", mode);
            List<String> options = new ArrayList<>();
            switch (mode) {
                case "ru_to_zh":
                    q.put("question", "「" + term.getRuTerm() + "」的中文是？");
                    q.put("correctAnswer", term.getCnTerm());
                    options.add(term.getCnTerm());
                    for (Term d : distractors) options.add(d.getCnTerm());
                    break;
                case "fill_blank":
                    String def = term.getDefinition() == null ? term.getCnTerm() : term.getDefinition();
                    q.put("question", "填空：" + def.replace(term.getCnTerm(), "______"));
                    q.put("correctAnswer", term.getCnTerm());
                    options.add(term.getCnTerm());
                    for (Term d : distractors) options.add(d.getCnTerm());
                    break;
                case "match":
                case "definition":
                    q.put("question", "「" + term.getCnTerm() + "」的释义是？");
                    q.put("correctAnswer", term.getDefinition() == null ? "-暂无释义-" : term.getDefinition());
                    options.add(term.getDefinition() == null ? "-暂无释义-" : term.getDefinition());
                    for (Term d : distractors) options.add(d.getDefinition() == null ? "-暂无释义-" : d.getDefinition());
                    break;
                case "zh_to_ru":
                default:
                    q.put("question", "「" + term.getCnTerm() + "」的俄文是？");
                    q.put("correctAnswer", term.getRuTerm());
                    options.add(term.getRuTerm());
                    for (Term d : distractors) options.add(d.getRuTerm());
                    break;
            }
            Collections.shuffle(options);
            q.put("options", options);
            questions.add(q);
        }
        return Result.ok(questions);
    }

    // ---------------- 学习记录 ----------------
    @PostMapping("/records")
    public Result<Map<String, Object>> record(@RequestBody Requests.RecordReq req) {
        UserContext.CurrentUser cu = UserContext.require();
        LearningRecord r = new LearningRecord();
        r.setUserId(cu.id);
        r.setDbId(req.getDbId());
        r.setTargetType(req.getTargetType());
        r.setTargetId(req.getTargetId());
        r.setMode(req.getMode());
        r.setScore(req.getScore());
        r.setCorrectCount(req.getCorrectCount());
        r.setTotalCount(req.getTotalCount());
        r.setDuration(req.getDuration());
        if (req.getDetail() != null) {
            try {
                r.setDetail(objectMapper.writeValueAsString(req.getDetail()));
            } catch (Exception ignored) {
            }
        }
        recordMapper.insert(r);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("id", r.getId());
        return Result.ok(out);
    }

    @GetMapping("/records")
    public Result<List<LearningRecord>> myRecords(@RequestParam(defaultValue = "50") Integer limit) {
        Long uid = UserContext.require().id;
        return Result.ok(recordMapper.selectList(new QueryWrapper<LearningRecord>()
                .eq("userId", uid).orderByDesc("createdAt").last("LIMIT " + limit)));
    }

    @GetMapping("/stats")
    public Result<Map<String, Object>> stats() {
        Long uid = UserContext.require().id;
        List<LearningRecord> records = recordMapper.selectList(
                new QueryWrapper<LearningRecord>().eq("userId", uid));

        int totalSessions = records.size();
        int totalDuration = records.stream().mapToInt(r -> r.getDuration() == null ? 0 : r.getDuration()).sum();
        List<LearningRecord> quiz = new ArrayList<>();
        int mastered = 0;
        for (LearningRecord r : records) {
            if ("quiz".equals(r.getMode())) quiz.add(r);
            if ("flashcard".equals(r.getMode()) && Integer.valueOf(1).equals(r.getScore())) mastered++;
        }
        int avgScore = quiz.isEmpty() ? 0
                : Math.round((float) quiz.stream().mapToInt(r -> r.getScore() == null ? 0 : r.getScore()).sum() / quiz.size());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalSessions", totalSessions);
        out.put("totalDuration", totalDuration);
        out.put("avgScore", avgScore);
        out.put("quizCount", quiz.size());
        out.put("masteredCount", mastered);
        return Result.ok(out);
    }

    // ---------------- 对比 / 情境 ----------------
    @GetMapping("/compare")
    public Result<List<Term>> compare(@RequestParam(required = false, defaultValue = "1") Long dbId) {
        return Result.ok(termMapper.selectList(new QueryWrapper<Term>()
                .eq("dbId", dbId).eq("status", "active").orderByDesc("updatedAt").last("LIMIT 20")));
    }

    @GetMapping("/scenario")
    public Result<List<Resource>> scenario(@RequestParam(required = false) Long dbId) {
        QueryWrapper<Resource> w = new QueryWrapper<>();
        w.eq("moduleType", "dialogue").eq("status", "active");
        if (dbId != null) w.eq("dbId", dbId);
        w.orderByDesc("createdAt");
        return Result.ok(resourceMapper.selectList(w));
    }

    // ---------------- 学习路径 ----------------
    @GetMapping("/paths")
    public Result<List<LearningPath>> paths() {
        List<LearningPath> paths = pathMapper.selectList(
                new QueryWrapper<LearningPath>().eq("status", "active").orderByAsc("sortOrder"));
        for (LearningPath p : paths) {
            p.setNodes(pathNodeMapper.selectList(new QueryWrapper<LearningPathNode>()
                    .eq("pathId", p.getId()).orderByAsc("sortOrder")));
        }
        return Result.ok(paths);
    }

    @GetMapping("/paths/{id}")
    public Result<LearningPath> pathById(@PathVariable Long id) {
        LearningPath p = pathMapper.selectById(id);
        if (p == null) throw ApiException.notFound("学习路径不存在");
        p.setNodes(pathNodeMapper.selectList(new QueryWrapper<LearningPathNode>()
                .eq("pathId", id).orderByAsc("sortOrder")));
        return Result.ok(p);
    }
}
