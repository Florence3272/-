package com.cnru.termbank.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cnru.termbank.common.Result;
import com.cnru.termbank.dto.Requests;
import com.cnru.termbank.entity.Announcement;
import com.cnru.termbank.mapper.AnnouncementMapper;
import com.cnru.termbank.security.UserContext;
import com.cnru.termbank.service.AuditService;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/announcements")
public class AnnouncementController {

    private final AnnouncementMapper announcementMapper;
    private final AuditService auditService;

    public AnnouncementController(AnnouncementMapper announcementMapper, AuditService auditService) {
        this.announcementMapper = announcementMapper;
        this.auditService = auditService;
    }

    /** 公开列表 */
    @GetMapping
    public Result<List<Announcement>> list(@RequestParam(required = false) String type) {
        QueryWrapper<Announcement> w = new QueryWrapper<>();
        w.eq("status", "published");
        if (type != null && !type.isEmpty()) w.eq("type", type);
        w.orderByAsc("sortOrder").orderByDesc("createdAt");
        return Result.ok(announcementMapper.selectList(w));
    }

    @PostMapping
    public Result<Announcement> create(@Valid @RequestBody Requests.AnnouncementReq req) {
        UserContext.CurrentUser cu = UserContext.requireAdmin();
        Announcement a = new Announcement();
        a.setTitle(req.getTitle());
        a.setContent(req.getContent());
        a.setType(req.getType());
        a.setLinkUrl(req.getLinkUrl());
        a.setStatus(req.getStatus());
        a.setSortOrder(req.getSortOrder());
        a.setCreatedBy(cu.id);
        announcementMapper.insert(a);
        auditService.log(cu.id, "create", "announcement", a.getId(), null);
        return Result.ok(a, "已发布");
    }

    @PutMapping("/{id}")
    public Result<Announcement> update(@PathVariable Long id, @RequestBody Requests.AnnouncementReq req) {
        UserContext.requireAdmin();
        Announcement a = new Announcement();
        a.setId(id);
        a.setTitle(req.getTitle());
        a.setContent(req.getContent());
        a.setType(req.getType());
        a.setLinkUrl(req.getLinkUrl());
        a.setStatus(req.getStatus());
        a.setSortOrder(req.getSortOrder());
        announcementMapper.updateById(a);
        return Result.ok(announcementMapper.selectById(id), "已保存");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        UserContext.requireAdmin();
        announcementMapper.deleteById(id);
        return Result.ok(null, "已删除");
    }
}
