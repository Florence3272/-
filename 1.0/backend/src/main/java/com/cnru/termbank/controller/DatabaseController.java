package com.cnru.termbank.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cnru.termbank.common.ApiException;
import com.cnru.termbank.common.PageResult;
import com.cnru.termbank.common.Result;
import com.cnru.termbank.dto.Requests;
import com.cnru.termbank.entity.*;
import com.cnru.termbank.mapper.*;
import com.cnru.termbank.security.UserContext;
import com.cnru.termbank.service.AccessService;
import com.cnru.termbank.service.AuditService;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/databases")
public class DatabaseController {

    private final TermDatabaseMapper databaseMapper;
    private final UserDatabaseRoleMapper roleMapper;
    private final UserMapper userMapper;
    private final TermMapper termMapper;
    private final ResourceMapper resourceMapper;
    private final AccessService accessService;
    private final AuditService auditService;

    public DatabaseController(TermDatabaseMapper databaseMapper, UserDatabaseRoleMapper roleMapper,
                              UserMapper userMapper, TermMapper termMapper, ResourceMapper resourceMapper,
                              AccessService accessService, AuditService auditService) {
        this.databaseMapper = databaseMapper;
        this.roleMapper = roleMapper;
        this.userMapper = userMapper;
        this.termMapper = termMapper;
        this.resourceMapper = resourceMapper;
        this.accessService = accessService;
        this.auditService = auditService;
    }

    // ---------------- 列表 / 分类 ----------------
    @GetMapping
    public Result<List<TermDatabase>> list(@RequestParam(required = false) String search,
                                           @RequestParam(required = false) String category,
                                           @RequestParam(required = false) Boolean mine) {
        UserContext.CurrentUser cu = UserContext.get();
        boolean isAdmin = cu != null && cu.isAdmin();
        Long viewerId = cu != null ? cu.id : null;
        Long mineUserId = (mine != null && mine && cu != null) ? cu.id : null;
        return Result.ok(databaseMapper.listWithOwner(search, category, mineUserId, viewerId, !isAdmin));
    }

    @GetMapping("/categories")
    public Result<List<String>> categories() {
        return Result.ok(databaseMapper.listCategories());
    }

    // ---------------- 详情 ----------------
    @GetMapping("/{id}")
    public Result<TermDatabase> byId(@PathVariable Long id) {
        accessService.assertReadable(UserContext.get(), id);
        TermDatabase db = databaseMapper.selectById(id);
        if (db == null) throw ApiException.notFound("分库不存在");
        db.setMemberCount(roleMapper.selectCount(new QueryWrapper<UserDatabaseRole>().eq("dbId", id)));
        return Result.ok(db);
    }

    // ---------------- 增删改 ----------------
    @PostMapping
    public Result<TermDatabase> create(@Valid @RequestBody Requests.DatabaseReq req) {
        UserContext.CurrentUser cu = UserContext.require();
        TermDatabase db = new TermDatabase();
        db.setName(req.getName());
        db.setCategory(req.getCategory());
        db.setDescription(req.getDescription());
        db.setOwnerId(cu.id);
        db.setVisibility(req.getVisibility() == null ? "public" : req.getVisibility());
        db.setTermCount(0);
        db.setStatus("active");
        databaseMapper.insert(db);

        UserDatabaseRole role = new UserDatabaseRole();
        role.setUserId(cu.id);
        role.setDbId(db.getId());
        role.setRole("admin");
        roleMapper.insert(role);

        auditService.log(cu.id, "create", "database", db.getId(), req);
        return Result.ok(databaseMapper.selectById(db.getId()), "创建成功");
    }

    @PutMapping("/{id}")
    public Result<TermDatabase> update(@PathVariable Long id, @RequestBody Requests.DatabaseReq req) {
        UserContext.CurrentUser cu = UserContext.require();
        accessService.assertAccess(cu, id, "admin");
        TermDatabase db = new TermDatabase();
        db.setId(id);
        db.setName(req.getName());
        db.setCategory(req.getCategory());
        db.setDescription(req.getDescription());
        db.setVisibility(req.getVisibility());
        databaseMapper.updateById(db);
        auditService.log(cu.id, "update", "database", id, req);
        return Result.ok(databaseMapper.selectById(id), "已保存");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        UserContext.CurrentUser cu = UserContext.require();
        accessService.assertAccess(cu, id, "admin");
        databaseMapper.deleteById(id);
        auditService.log(cu.id, "delete", "database", id, null);
        return Result.ok(null, "已删除");
    }

    @PostMapping("/{id}/archive")
    public Result<Void> archive(@PathVariable Long id) {
        UserContext.CurrentUser cu = UserContext.require();
        accessService.assertAccess(cu, id, "admin");
        TermDatabase db = new TermDatabase();
        db.setId(id);
        db.setStatus("archived");
        databaseMapper.updateById(db);
        auditService.log(cu.id, "archive", "database", id, null);
        return Result.ok(null, "已归档");
    }

    @PostMapping("/{id}/restore")
    public Result<Void> restore(@PathVariable Long id) {
        UserContext.CurrentUser cu = UserContext.require();
        accessService.assertAccess(cu, id, "admin");
        TermDatabase db = new TermDatabase();
        db.setId(id);
        db.setStatus("active");
        databaseMapper.updateById(db);
        return Result.ok(null, "已恢复");
    }

    // ---------------- 分库内术语 ----------------
    @GetMapping("/{id}/terms")
    public Result<PageResult<Term>> terms(@PathVariable Long id,
                                          @RequestParam(required = false) String search,
                                          @RequestParam(required = false) String pos,
                                          @RequestParam(required = false) String tags,
                                          @RequestParam(defaultValue = "active") String status,
                                          @RequestParam(defaultValue = "updatedAt") String sort,
                                          @RequestParam(defaultValue = "1") long page,
                                          @RequestParam(defaultValue = "200") long pageSize) {
        accessService.assertReadable(UserContext.get(), id);
        QueryWrapper<Term> w = new QueryWrapper<>();
        w.eq("dbId", id).eq("status", status);
        if (search != null && !search.isEmpty()) {
            w.and(q -> q.like("cnTerm", search).or().like("ruTerm", search)
                    .or().like("enTerm", search).or().like("definition", search));
        }
        if (pos != null && !pos.isEmpty()) w.eq("pos", pos);
        if (tags != null && !tags.isEmpty()) w.like("tags", tags);
        if ("cnTerm".equals(sort) || "ruTerm".equals(sort)) {
            w.orderByAsc(sort);
        } else {
            w.orderByDesc("updatedAt");
        }

        Page<Term> p = termMapper.selectPage(new Page<>(page, pageSize), w);
        return Result.ok(new PageResult<>(p.getRecords(), p.getTotal(), p.getCurrent(), p.getSize()));
    }

    @PostMapping("/{id}/terms")
    public Result<Term> createTerm(@PathVariable Long id, @Valid @RequestBody Requests.TermReq req) {
        UserContext.CurrentUser cu = UserContext.require();
        accessService.assertAccess(cu, id, "admin", "editor");
        Term term = new Term();
        term.setDbId(id);
        term.setCnTerm(req.getCnTerm());
        term.setRuTerm(req.getRuTerm());
        term.setEnTerm(req.getEnTerm());
        term.setDefinition(req.getDefinition());
        term.setContext(req.getContext());
        term.setCultureNote(req.getCultureNote());
        term.setPos(req.getPos());
        term.setTags(req.getTags());
        term.setStatus("active");
        term.setVersion(1);
        term.setCreatedBy(cu.id);
        term.setUpdatedBy(cu.id);
        termMapper.insert(term);
        accessService.refreshTermCount(id);
        auditService.log(cu.id, "create", "term", term.getId(), null);
        return Result.ok(termMapper.selectById(term.getId()), "创建成功");
    }

    // ---------------- 分库内资源 ----------------
    @GetMapping("/{id}/resources")
    public Result<List<Resource>> resources(@PathVariable Long id,
                                            @RequestParam(required = false) String moduleType) {
        accessService.assertReadable(UserContext.get(), id);
        QueryWrapper<Resource> w = new QueryWrapper<>();
        w.eq("dbId", id).eq("status", "active");
        if (moduleType != null && !moduleType.isEmpty()) w.eq("moduleType", moduleType);
        w.orderByDesc("createdAt");
        return Result.ok(resourceMapper.selectList(w));
    }

    // ---------------- 成员 / 权限 ----------------
    @GetMapping("/{id}/members")
    public Result<List<Map<String, Object>>> members(@PathVariable Long id) {
        accessService.assertAccess(UserContext.require(), id, "admin", "editor", "viewer");
        return Result.ok(roleMapper.listMembers(id));
    }

    @PostMapping("/{id}/members")
    public Result<Void> addMember(@PathVariable Long id, @Valid @RequestBody Requests.MemberReq req) {
        UserContext.CurrentUser cu = UserContext.require();
        accessService.assertAccess(cu, id, "admin");
        User target = userMapper.selectOne(new QueryWrapper<User>().eq("username", req.getUsername()).last("LIMIT 1"));
        if (target == null) throw ApiException.notFound("用户不存在");

        UserDatabaseRole existing = roleMapper.selectOne(new QueryWrapper<UserDatabaseRole>()
                .eq("userId", target.getId()).eq("dbId", id).last("LIMIT 1"));
        if (existing != null) {
            existing.setRole(req.getRole());
            roleMapper.updateById(existing);
        } else {
            UserDatabaseRole role = new UserDatabaseRole();
            role.setUserId(target.getId());
            role.setDbId(id);
            role.setRole(req.getRole());
            roleMapper.insert(role);
        }
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("userId", target.getId());
        detail.put("role", req.getRole());
        auditService.log(cu.id, "add_member", "database", id, detail);
        return Result.ok(null, "已添加成员");
    }

    @DeleteMapping("/{id}/members/{userId}")
    public Result<Void> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        UserContext.CurrentUser cu = UserContext.require();
        accessService.assertAccess(cu, id, "admin");
        roleMapper.delete(new QueryWrapper<UserDatabaseRole>().eq("dbId", id).eq("userId", userId));
        return Result.ok(null, "已移除成员");
    }
}
