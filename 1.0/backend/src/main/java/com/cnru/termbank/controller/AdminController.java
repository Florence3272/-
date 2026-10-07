package com.cnru.termbank.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cnru.termbank.common.Result;
import com.cnru.termbank.dto.Requests;
import com.cnru.termbank.entity.LearningRecord;
import com.cnru.termbank.entity.Term;
import com.cnru.termbank.entity.User;
import com.cnru.termbank.mapper.*;
import com.cnru.termbank.security.UserContext;
import com.cnru.termbank.service.AuditService;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserMapper userMapper;
    private final TermDatabaseMapper databaseMapper;
    private final TermMapper termMapper;
    private final ResourceMapper resourceMapper;
    private final LearningRecordMapper recordMapper;
    private final TranslationTaskMapper taskMapper;
    private final AuditLogMapper auditLogMapper;
    private final AuditService auditService;

    public AdminController(UserMapper userMapper, TermDatabaseMapper databaseMapper, TermMapper termMapper,
                           ResourceMapper resourceMapper, LearningRecordMapper recordMapper,
                           TranslationTaskMapper taskMapper, AuditLogMapper auditLogMapper,
                           AuditService auditService) {
        this.userMapper = userMapper;
        this.databaseMapper = databaseMapper;
        this.termMapper = termMapper;
        this.resourceMapper = resourceMapper;
        this.recordMapper = recordMapper;
        this.taskMapper = taskMapper;
        this.auditLogMapper = auditLogMapper;
        this.auditService = auditService;
    }

    @GetMapping("/stats")
    public Result<Map<String, Object>> stats() {
        UserContext.requireAdmin();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("userCount", userMapper.countAll());
        out.put("dbCount", databaseMapper.countActive());
        out.put("termCount", termMapper.countActive());
        out.put("resourceCount", resourceMapper.countActive());
        out.put("recordCount", recordMapper.countAll());
        out.put("translationCount", taskMapper.countAll());
        return Result.ok(out);
    }

    @GetMapping("/users")
    public Result<List<User>> users(@RequestParam(required = false) String search,
                                    @RequestParam(required = false) String role) {
        UserContext.requireAdmin();
        QueryWrapper<User> w = new QueryWrapper<>();
        if (role != null && !role.isEmpty()) w.eq("role", role);
        if (search != null && !search.isEmpty()) {
            w.and(q -> q.like("username", search).or().like("name", search).or().like("email", search));
        }
        w.orderByDesc("createdAt").last("LIMIT 100");
        return Result.ok(userMapper.selectList(w));
    }

    @PutMapping("/users/{id}/role")
    public Result<Void> updateRole(@PathVariable Long id, @RequestBody Requests.RoleReq req) {
        UserContext.CurrentUser cu = UserContext.requireAdmin();
        if (id.equals(cu.id)) return Result.fail("不能修改自己的角色");
        User update = new User();
        update.setId(id);
        update.setRole(req.getRole());
        userMapper.updateById(update);
        auditService.log(cu.id, "update_role", "user", id, req);
        return Result.ok(null, "已更新角色");
    }

    @PutMapping("/users/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Requests.StatusReq req) {
        UserContext.CurrentUser cu = UserContext.requireAdmin();
        if (id.equals(cu.id)) return Result.fail("不能禁用自己的账号");
        User update = new User();
        update.setId(id);
        update.setStatus(req.getStatus());
        userMapper.updateById(update);
        auditService.log(cu.id, "update_status", "user", id, req);
        return Result.ok(null, "已更新状态");
    }

    @GetMapping("/activities")
    public Result<Map<String, Object>> activities() {
        UserContext.requireAdmin();
        List<Term> recentTerms = termMapper.selectList(new QueryWrapper<Term>()
                .eq("status", "active").orderByDesc("createdAt").last("LIMIT 10"));
        List<Map<String, Object>> recentRecords = recordMapper.recentWithUser();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("recentTerms", recentTerms);
        out.put("recentRecords", recentRecords);
        return Result.ok(out);
    }

    @GetMapping("/term-growth")
    public Result<List<Map<String, Object>>> termGrowth() {
        UserContext.requireAdmin();
        return Result.ok(termMapper.growthByMonth());
    }

    @GetMapping("/audit-logs")
    public Result<List<Map<String, Object>>> auditLogs(@RequestParam(defaultValue = "50") Integer limit) {
        UserContext.requireAdmin();
        return Result.ok(auditLogMapper.listWithUser(limit));
    }
}
