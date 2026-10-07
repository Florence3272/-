package com.cnru.termbank.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cnru.termbank.common.ApiException;
import com.cnru.termbank.common.Result;
import com.cnru.termbank.dto.Requests;
import com.cnru.termbank.entity.Resource;
import com.cnru.termbank.mapper.ResourceMapper;
import com.cnru.termbank.security.UserContext;
import com.cnru.termbank.service.AccessService;
import com.cnru.termbank.service.AuditService;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/resources")
public class ResourceController {

    private final ResourceMapper resourceMapper;
    private final AccessService accessService;
    private final AuditService auditService;

    public ResourceController(ResourceMapper resourceMapper, AccessService accessService, AuditService auditService) {
        this.resourceMapper = resourceMapper;
        this.accessService = accessService;
        this.auditService = auditService;
    }

    @GetMapping("/module-types")
    public Result<List<Map<String, String>>> moduleTypes() {
        List<Map<String, String>> list = new ArrayList<>();
        String[][] types = {
                {"dialogue", "情境对话"}, {"reading", "专业阅读"}, {"case", "案例分析"},
                {"video", "微课视频"}, {"quiz", "习题测试"}, {"culture", "文化贴士"}
        };
        for (String[] t : types) {
            Map<String, String> m = new LinkedHashMap<>();
            m.put("value", t[0]);
            m.put("label", t[1]);
            list.add(m);
        }
        return Result.ok(list);
    }

    @GetMapping
    public Result<List<Resource>> list(@RequestParam(required = false) Long dbId,
                                       @RequestParam(required = false) String moduleType) {
        QueryWrapper<Resource> w = new QueryWrapper<>();
        w.eq("status", "active");
        if (dbId != null) {
            accessService.assertReadable(UserContext.get(), dbId);
            w.eq("dbId", dbId);
        }
        if (moduleType != null && !moduleType.isEmpty()) w.eq("moduleType", moduleType);
        w.orderByDesc("createdAt");
        return Result.ok(resourceMapper.selectList(w));
    }

    @GetMapping("/{id}")
    public Result<Resource> byId(@PathVariable Long id) {
        Resource r = resourceMapper.selectById(id);
        if (r == null) throw ApiException.notFound("资源不存在");
        accessService.assertReadable(UserContext.get(), r.getDbId());
        return Result.ok(r);
    }

    @PostMapping
    public Result<Resource> create(@RequestBody Requests.ResourceReq req) {
        UserContext.CurrentUser cu = UserContext.require();
        if (req.getDbId() == null) throw ApiException.badRequest("请指定分库");
        accessService.assertAccess(cu, req.getDbId(), "admin", "editor");
        Resource r = new Resource();
        r.setDbId(req.getDbId());
        r.setModuleType(req.getModuleType());
        r.setTitle(req.getTitle());
        r.setContent(req.getContent());
        r.setCoverUrl(req.getCoverUrl());
        r.setMediaUrl(req.getMediaUrl());
        r.setDifficulty(req.getDifficulty() == null ? "beginner" : req.getDifficulty());
        r.setDuration(req.getDuration());
        r.setStatus("active");
        r.setCreatorId(cu.id);
        resourceMapper.insert(r);
        auditService.log(cu.id, "create", "resource", r.getId(), null);
        return Result.ok(r, "创建成功");
    }

    @PutMapping("/{id}")
    public Result<Resource> update(@PathVariable Long id, @RequestBody Requests.ResourceReq req) {
        UserContext.CurrentUser cu = UserContext.require();
        Resource existing = resourceMapper.selectById(id);
        if (existing == null) throw ApiException.notFound("资源不存在");
        accessService.assertAccess(cu, existing.getDbId(), "admin", "editor");
        Resource r = new Resource();
        r.setId(id);
        r.setTitle(req.getTitle());
        r.setContent(req.getContent());
        r.setCoverUrl(req.getCoverUrl());
        r.setMediaUrl(req.getMediaUrl());
        r.setModuleType(req.getModuleType());
        r.setDifficulty(req.getDifficulty());
        r.setDuration(req.getDuration());
        resourceMapper.updateById(r);
        return Result.ok(resourceMapper.selectById(id), "已保存");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        UserContext.CurrentUser cu = UserContext.require();
        Resource existing = resourceMapper.selectById(id);
        if (existing == null) throw ApiException.notFound("资源不存在");
        accessService.assertAccess(cu, existing.getDbId(), "admin", "editor");
        Resource r = new Resource();
        r.setId(id);
        r.setStatus("deleted");
        resourceMapper.updateById(r);
        auditService.log(cu.id, "delete", "resource", id, null);
        return Result.ok(null, "已删除");
    }
}
