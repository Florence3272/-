package com.cnru.termbank.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cnru.termbank.common.ApiException;
import com.cnru.termbank.common.Result;
import com.cnru.termbank.dto.Requests;
import com.cnru.termbank.entity.Term;
import com.cnru.termbank.entity.TermMedia;
import com.cnru.termbank.entity.TermRelation;
import com.cnru.termbank.entity.TermVersion;
import com.cnru.termbank.mapper.*;
import com.cnru.termbank.security.UserContext;
import com.cnru.termbank.service.AccessService;
import com.cnru.termbank.service.AuditService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/terms")
public class TermController {

    private final TermMapper termMapper;
    private final TermMediaMapper mediaMapper;
    private final TermRelationMapper relationMapper;
    private final TermVersionMapper versionMapper;
    private final TermDatabaseMapper databaseMapper;
    private final ResourceMapper resourceMapper;
    private final UserMapper userMapper;
    private final AccessService accessService;
    private final AuditService auditService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TermController(TermMapper termMapper, TermMediaMapper mediaMapper, TermRelationMapper relationMapper,
                          TermVersionMapper versionMapper, TermDatabaseMapper databaseMapper,
                          ResourceMapper resourceMapper, UserMapper userMapper,
                          AccessService accessService, AuditService auditService) {
        this.termMapper = termMapper;
        this.mediaMapper = mediaMapper;
        this.relationMapper = relationMapper;
        this.versionMapper = versionMapper;
        this.databaseMapper = databaseMapper;
        this.resourceMapper = resourceMapper;
        this.userMapper = userMapper;
        this.accessService = accessService;
        this.auditService = auditService;
    }

    // ---------------- 检索 / 统计 ----------------
    @GetMapping("/search")
    public Result<Map<String, Object>> search(@RequestParam String q,
                                              @RequestParam(required = false) Long dbId) {
        List<Term> list = termMapper.globalSearch(q, dbId);
        Map<Long, Map<String, Object>> groups = new LinkedHashMap<>();
        for (Term t : list) {
            groups.computeIfAbsent(t.getDbId(), k -> {
                Map<String, Object> g = new LinkedHashMap<>();
                g.put("dbId", t.getDbId());
                g.put("dbName", t.getDbName() == null ? "未命名分库" : t.getDbName());
                g.put("items", new ArrayList<Term>());
                return g;
            });
            @SuppressWarnings("unchecked")
            List<Term> items = (List<Term>) groups.get(t.getDbId()).get("items");
            items.add(t);
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("list", list);
        out.put("groups", new ArrayList<>(groups.values()));
        out.put("total", list.size());
        return Result.ok(out);
    }

    @GetMapping("/pos-list")
    public Result<List<String>> posList() {
        return Result.ok(termMapper.listPos());
    }

    @GetMapping("/stats")
    public Result<Map<String, Object>> stats() {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalTerms", termMapper.countActive());
        out.put("totalDatabases", databaseMapper.countActive());
        out.put("totalResources", resourceMapper.countActive());
        out.put("totalUsers", userMapper.countAll());
        return Result.ok(out);
    }

    @GetMapping("/export")
    public Result<List<Term>> export(@RequestParam(required = false) Long dbId) {
        QueryWrapper<Term> w = new QueryWrapper<>();
        w.eq("status", "active");
        if (dbId != null) w.eq("dbId", dbId);
        w.orderByAsc("dbId", "id");
        return Result.ok(termMapper.selectList(w));
    }

    @PostMapping("/import")
    public Result<Map<String, Object>> importTerms(@RequestBody Requests.ImportReq req) {
        UserContext.CurrentUser cu = UserContext.require();
        if (req.getDbId() == null) throw ApiException.badRequest("请指定分库");
        accessService.assertAccess(cu, req.getDbId(), "admin", "editor");
        if (req.getItems() == null || req.getItems().isEmpty()) throw ApiException.badRequest("导入数据不能为空");

        int inserted = 0;
        List<Map<String, Object>> errors = new ArrayList<>();
        for (int i = 0; i < req.getItems().size(); i++) {
            Requests.TermReq item = req.getItems().get(i);
            try {
                if (item.getCnTerm() == null || item.getRuTerm() == null) {
                    throw new IllegalArgumentException("中文名/俄文名不能为空");
                }
                Term term = new Term();
                term.setDbId(req.getDbId());
                term.setCnTerm(item.getCnTerm());
                term.setRuTerm(item.getRuTerm());
                term.setEnTerm(item.getEnTerm());
                term.setDefinition(item.getDefinition());
                term.setContext(item.getContext());
                term.setCultureNote(item.getCultureNote());
                term.setPos(item.getPos());
                term.setTags(item.getTags());
                term.setStatus("active");
                term.setVersion(1);
                term.setCreatedBy(cu.id);
                term.setUpdatedBy(cu.id);
                termMapper.insert(term);
                inserted++;
            } catch (Exception e) {
                Map<String, Object> err = new LinkedHashMap<>();
                err.put("index", i);
                err.put("message", e.getMessage());
                errors.add(err);
            }
        }
        accessService.refreshTermCount(req.getDbId());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("inserted", inserted);
        out.put("failed", errors.size());
        out.put("errors", errors);
        auditService.log(cu.id, "import", "term", null, out);
        return Result.ok(out, "导入完成");
    }

    // ---------------- 详情 / 编辑 / 删除 ----------------
    @GetMapping("/{id}")
    public Result<Map<String, Object>> byId(@PathVariable Long id) {
        Term term = termMapper.selectById(id);
        if (term == null) throw ApiException.notFound("术语不存在");
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("term", term);
        out.put("media", mediaMapper.selectList(new QueryWrapper<TermMedia>().eq("termId", id).orderByAsc("sortOrder")));
        out.put("relations", relationMapper.listRelated(id));
        // 为前端方便，平铺返回
        out.put("id", term.getId());
        out.put("dbId", term.getDbId());
        out.put("cnTerm", term.getCnTerm());
        out.put("ruTerm", term.getRuTerm());
        out.put("enTerm", term.getEnTerm());
        out.put("definition", term.getDefinition());
        out.put("context", term.getContext());
        out.put("cultureNote", term.getCultureNote());
        out.put("pos", term.getPos());
        out.put("tags", term.getTags());
        out.put("version", term.getVersion());
        out.put("updatedAt", term.getUpdatedAt());
        out.put("createdAt", term.getCreatedAt());
        return Result.ok(out);
    }

    @PutMapping("/{id}")
    public Result<Term> update(@PathVariable Long id, @RequestBody Requests.TermReq req) {
        UserContext.CurrentUser cu = UserContext.require();
        Term before = termMapper.selectById(id);
        if (before == null) throw ApiException.notFound("术语不存在");
        accessService.assertAccess(cu, before.getDbId(), "admin", "editor");

        Term term = new Term();
        term.setId(id);
        term.setCnTerm(req.getCnTerm());
        term.setRuTerm(req.getRuTerm());
        term.setEnTerm(req.getEnTerm());
        term.setDefinition(req.getDefinition());
        term.setContext(req.getContext());
        term.setCultureNote(req.getCultureNote());
        term.setPos(req.getPos());
        term.setTags(req.getTags());
        term.setUpdatedBy(cu.id);
        term.setVersion((before.getVersion() == null ? 1 : before.getVersion()) + 1);
        termMapper.updateById(term);

        Term after = termMapper.selectById(id);
        try {
            TermVersion v = new TermVersion();
            v.setTermId(id);
            v.setVersion(after.getVersion());
            v.setSnapshot(objectMapper.writeValueAsString(after));
            v.setChangeType("update");
            v.setChangedBy(cu.id);
            v.setChangeNote(req.getChangeNote());
            versionMapper.insert(v);
        } catch (Exception ignored) {
        }
        auditService.log(cu.id, "update", "term", id, null);
        return Result.ok(after, "已保存");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        UserContext.CurrentUser cu = UserContext.require();
        Term term = termMapper.selectById(id);
        if (term == null) throw ApiException.notFound("术语不存在");
        accessService.assertAccess(cu, term.getDbId(), "admin", "editor");
        Term update = new Term();
        update.setId(id);
        update.setStatus("deleted");
        update.setUpdatedBy(cu.id);
        termMapper.updateById(update);
        accessService.refreshTermCount(term.getDbId());
        auditService.log(cu.id, "delete", "term", id, null);
        return Result.ok(null, "已删除（可在回收站恢复）");
    }

    @PostMapping("/{id}/restore")
    public Result<Void> restore(@PathVariable Long id) {
        UserContext.CurrentUser cu = UserContext.require();
        Term term = termMapper.selectById(id);
        if (term == null) throw ApiException.notFound("术语不存在");
        accessService.assertAccess(cu, term.getDbId(), "admin", "editor");
        Term update = new Term();
        update.setId(id);
        update.setStatus("active");
        termMapper.updateById(update);
        accessService.refreshTermCount(term.getDbId());
        return Result.ok(null, "已恢复");
    }

    @GetMapping("/{id}/versions")
    public Result<List<Map<String, Object>>> versions(@PathVariable Long id) {
        return Result.ok(versionMapper.listByTerm(id));
    }

    // ---------------- 富媒体 ----------------
    @PostMapping("/{id}/media")
    public Result<TermMedia> addMedia(@PathVariable Long id, @RequestBody Requests.MediaReq req) {
        UserContext.CurrentUser cu = UserContext.require();
        Term term = termMapper.selectById(id);
        if (term == null) throw ApiException.notFound("术语不存在");
        accessService.assertAccess(cu, term.getDbId(), "admin", "editor");
        TermMedia media = new TermMedia();
        media.setTermId(id);
        media.setType(req.getType());
        media.setUrl(req.getUrl());
        media.setDescription(req.getDescription());
        media.setSortOrder(req.getSortOrder() == null ? 0 : req.getSortOrder());
        mediaMapper.insert(media);
        return Result.ok(media, "已添加");
    }

    @DeleteMapping("/media/{mediaId}")
    public Result<Void> removeMedia(@PathVariable Long mediaId) {
        UserContext.require();
        mediaMapper.deleteById(mediaId);
        return Result.ok(null, "已删除");
    }

    // ---------------- 关联术语 ----------------
    @GetMapping("/{id}/relations")
    public Result<List<Map<String, Object>>> relations(@PathVariable Long id) {
        return Result.ok(relationMapper.listRelated(id));
    }

    @PostMapping("/{id}/relations")
    public Result<Void> addRelation(@PathVariable Long id, @RequestBody Requests.RelationReq req) {
        UserContext.CurrentUser cu = UserContext.require();
        Term term = termMapper.selectById(id);
        if (term == null) throw ApiException.notFound("术语不存在");
        accessService.assertAccess(cu, term.getDbId(), "admin", "editor");
        Long exists = relationMapper.selectCount(new QueryWrapper<TermRelation>()
                .eq("termId", id).eq("relatedTermId", req.getRelatedTermId())
                .eq("relationType", req.getRelationType()));
        if (exists == null || exists == 0) {
            TermRelation r = new TermRelation();
            r.setTermId(id);
            r.setRelatedTermId(req.getRelatedTermId());
            r.setRelationType(req.getRelationType());
            relationMapper.insert(r);
        }
        return Result.ok(null, "已关联");
    }

    @DeleteMapping("/relations/{relationId}")
    public Result<Void> removeRelation(@PathVariable Long relationId) {
        UserContext.require();
        relationMapper.deleteById(relationId);
        return Result.ok(null, "已取消关联");
    }
}
